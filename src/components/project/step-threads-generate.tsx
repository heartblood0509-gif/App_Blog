"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ContentPreview } from "./content-preview";
import { useStreaming } from "@/hooks/use-streaming";
import type { ThreadsSettings } from "./step-threads-settings";
import { Wand2, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface StepThreadsGenerateProps {
  settings: ThreadsSettings;
}

export function StepThreadsGenerate({ settings }: StepThreadsGenerateProps) {
  const streamCallbacks = useMemo(
    () => ({
      onComplete: () => {
        toast.success("쓰레드 생성이 완료되었습니다.");
      },
      onError: (msg: string) => {
        toast.error(msg);
      },
    }),
    []
  );

  const {
    data: generatedContent,
    isStreaming: isGenerating,
    startStream,
    abortStream,
    reset,
  } = useStreaming(streamCallbacks);

  const handleGenerate = () => {
    startStream("/api/generate-threads", {
      url: settings.newsUrl.trim(),
      requirements: settings.requirements.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
          쓰레드 생성
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground">
          뉴스 기사를 분석하여 쓰레드 게시물을 작성합니다
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-md border bg-muted/30 p-5 space-y-2 max-w-lg mx-auto">
        <div className="grid grid-cols-[90px_1fr] gap-1.5 text-base">
          <span className="text-muted-foreground">기사 링크</span>
          <span className="font-semibold truncate">{settings.newsUrl}</span>
          {settings.requirements && (
            <>
              <span className="text-muted-foreground">요구사항</span>
              <span className="font-semibold truncate">
                {settings.requirements}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Generate controls */}
      <div className="flex items-center justify-center gap-3">
        {!generatedContent && !isGenerating && (
          <Button
            onClick={handleGenerate}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-base px-6 py-2.5"
          >
            <Wand2 className="h-5 w-5" />
            쓰레드 생성
          </Button>
        )}
        {isGenerating && (
          <>
            <Button variant="destructive" onClick={abortStream}>
              생성 중단
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              뉴스 기사를 분석하고 쓰레드를 작성하고 있습니다...
            </div>
          </>
        )}
        {generatedContent && !isGenerating && (
          <Button variant="outline" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            다시 생성
          </Button>
        )}
      </div>

      {/* Content preview */}
      {(generatedContent || isGenerating) && (
        <>
          <Separator />
          <ContentPreview content={generatedContent} isLoading={isGenerating} />
        </>
      )}
    </div>
  );
}
