"use client";

import { useState, useCallback, useRef } from "react";
import { getStoredApiKey } from "@/lib/api-key";

interface UseStreamingOptions {
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
  /**
   * 옵셔널 sentinel. 스트림 중 이 문자열을 만나면 그 이전까지만 data에 표시하고,
   * 이후 payload는 onFinal 콜백으로 전달한다. 2-패스 파이프라인용.
   */
  sentinel?: string;
  onFinal?: (payloadAfterSentinel: string, displayText: string) => void;
  /**
   * 2-패스 경계 상태를 UI에 알리기 위한 콜백. sentinel 감지 시 true.
   */
  onPhaseChange?: (phase: "pass1" | "pass2") => void;
}

export function useStreaming(options?: UseStreamingOptions) {
  const [data, setData] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (url: string, body: Record<string, unknown>) => {
      setData("");
      setError(null);
      setIsStreaming(true);
      options?.onPhaseChange?.("pass1");

      abortControllerRef.current = new AbortController();

      try {
        const storedKey = getStoredApiKey();
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(storedKey && { "x-api-key": storedKey }),
          },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const message =
            errorData?.error || `오류가 발생했습니다 (${response.status})`;
          setError(message);
          options?.onError?.(message);
          setIsStreaming(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setError("스트리밍 응답을 읽을 수 없습니다.");
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        const sentinel = options?.sentinel;
        let fullText = "";
        let sentinelFound = false;
        let displayText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          if (sentinel && !sentinelFound) {
            const idx = fullText.indexOf(sentinel);
            if (idx !== -1) {
              sentinelFound = true;
              displayText = fullText.slice(0, idx);
              setData(displayText);
              options?.onPhaseChange?.("pass2");
            } else {
              // sentinel 부분 매칭을 피하기 위해 꼬리 일부를 숨김
              const safe = fullText.slice(
                0,
                Math.max(0, fullText.length - sentinel.length)
              );
              setData(safe);
            }
          } else if (!sentinel) {
            setData(fullText);
          }
          // sentinelFound 이후에는 data를 갱신하지 않음 (payload가 새는 걸 막음)
        }

        if (sentinel && sentinelFound) {
          const idx = fullText.indexOf(sentinel);
          const payload = fullText.slice(idx + sentinel.length);
          setData(displayText);
          options?.onFinal?.(payload, displayText);
        }

        options?.onComplete?.(
          sentinel && sentinelFound ? displayText : fullText
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // User aborted, not an error
        } else {
          const message =
            err instanceof Error ? err.message : "알 수 없는 오류";
          setError(message);
          options?.onError?.(message);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [options]
  );

  const abortStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setData("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return { data, isStreaming, error, startStream, abortStream, reset };
}
