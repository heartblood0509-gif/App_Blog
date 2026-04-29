import { generateSchema } from "@/lib/validations";
import { getGeminiClient, formatGeminiError, withRetry } from "@/lib/gemini";
import { buildCreativePrompt } from "@/lib/prompts";
import {
  parseImagePlan,
  injectImageMarkers,
  buildImageInjectionPrompt,
} from "@/lib/image-injector";
import { applyForbiddenWordFilter } from "@/lib/forbidden-words";
import { rateLimit, getClientId, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 60;

/**
 * Pass 2 경계를 클라이언트에 알리는 sentinel.
 * 스트리밍 도중 이 마커 이후 줄부터 최종본 JSON이 전송된다.
 */
const PASS2_SENTINEL = "\n\n<<<PASS2>>>\n";

export async function POST(request: Request) {
  const { success } = rateLimit(getClientId(request), 10, 60_000);
  if (!success) return rateLimitResponse();

  try {
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      analysisResult,
      topic,
      keywords,
      selectedTitle,
      persona,
      productName,
      productAdvantages,
      productLink,
      requirements,
      charCountRange,
      includeImageDesc,
    } = parsed.data;

    const clientApiKey = request.headers.get("x-api-key") || undefined;
    const client = getGeminiClient(clientApiKey);

    // Pass 1: v1 스타일 단순 모방 프롬프트
    // includeImageDesc도 전달 — v1 프롬프트는 본문에 직접 [이미지:] 마커를 인라인으로 박음
    const creativePrompt = buildCreativePrompt(analysisResult, topic, keywords, {
      selectedTitle,
      persona,
      productName,
      productAdvantages,
      productLink,
      requirements,
      charCountRange,
      includeImageDesc,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let draft = "";

        try {
          // Pass 1: 스트리밍 (사용자에게 실시간 노출)
          const response = await withRetry(() =>
            client.models.generateContentStream({
              model: "gemini-2.5-flash",
              contents: creativePrompt,
            })
          );

          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              draft += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Pass 2: sentinel 송출 → 편집 단계 시작 신호
          controller.enqueue(encoder.encode(PASS2_SENTINEL));

          let finalText = draft;

          // Pass 2a: 이미지 마커 주입 (규칙 기반, includeImageDesc일 때만)
          // v1 스타일 프롬프트가 본문에 직접 [이미지:] 마커를 박는 경우엔 중복 방지를 위해 스킵.
          if (includeImageDesc && !finalText.includes("[이미지:")) {
            try {
              const plans = parseImagePlan(analysisResult);
              if (plans.length > 0) {
                const injected = injectImageMarkers(finalText, plans);
                if (injected.markerCount > 0) {
                  finalText = injected.text;
                }
              }
              // 규칙 기반 실패 시 LLM 폴백
              if (!finalText.includes("[이미지:")) {
                const fallbackResp = await withRetry(() =>
                  client.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: buildImageInjectionPrompt(finalText),
                  })
                );
                const fallbackText = fallbackResp.text ?? "";
                if (fallbackText && fallbackText.includes("[이미지:")) {
                  finalText = fallbackText;
                }
              }
            } catch {
              // 이미지 주입 실패 시 draft 그대로 유지
            }
          }

          // Pass 2b: 금지어 후처리 (정규식 기반, 항상 실행)
          const filtered = applyForbiddenWordFilter(finalText);
          finalText = filtered.text;

          // 최종 결과를 JSON으로 flush
          const payload = JSON.stringify({
            text: finalText,
            replaced: filtered.replaced,
            warnings: filtered.warnings,
          });
          controller.enqueue(encoder.encode(payload));
          controller.close();
        } catch (error) {
          // Pass 1 실패 시 에러 메시지만
          if (!draft) {
            controller.enqueue(
              encoder.encode(`\n\n[오류] ${formatGeminiError(error)}`)
            );
            controller.close();
            return;
          }
          // Pass 2 실패 시 draft를 최종본으로 확정
          controller.enqueue(encoder.encode(PASS2_SENTINEL));
          const payload = JSON.stringify({
            text: draft,
            replaced: [],
            warnings: [],
            editError: formatGeminiError(error),
          });
          controller.enqueue(encoder.encode(payload));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "요청 처리 중 오류";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
