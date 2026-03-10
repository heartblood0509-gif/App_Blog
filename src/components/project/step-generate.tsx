"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentPreview } from "./content-preview";
import { ExportDialog } from "./export-dialog";
import { useStreaming } from "@/hooks/use-streaming";
import type { GenerationSettings } from "./step-settings";
import {
  Wand2,
  Loader2,
  RotateCcw,
  Youtube,
  Instagram,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";
import type { ConvertFormat } from "@/lib/prompts";

interface StepGenerateProps {
  analysisResult: string;
  referenceText: string;
  settings: GenerationSettings;
  selectedTitle: string;
}

const CONVERT_TABS: {
  id: ConvertFormat;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "youtube-longform",
    label: "유튜브 롱폼",
    icon: <Youtube className="h-3.5 w-3.5" />,
  },
  {
    id: "youtube-shortform",
    label: "유튜브 숏폼",
    icon: <Youtube className="h-3.5 w-3.5" />,
  },
  {
    id: "instagram",
    label: "인스타그램",
    icon: <Instagram className="h-3.5 w-3.5" />,
  },
  {
    id: "threads",
    label: "쓰레드",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
  },
];

const CHAR_RANGE_LABELS: Record<string, string> = {
  "1500-2500": "1,500~2,500자",
  "2500-3500": "2,500~3,500자",
  reference: "레퍼런스 글자수",
};

export function StepGenerate({
  analysisResult,
  referenceText,
  settings,
  selectedTitle,
}: StepGenerateProps) {
  const [activeConvertTab, setActiveConvertTab] =
    useState<ConvertFormat | null>(null);
  const activeConvertTabRef = useRef<ConvertFormat | null>(null);
  const [convertResults, setConvertResults] = useState<
    Record<string, string>
  >({});
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const saveToSupabase = async (generatedText: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.from("blog_projects").insert({
        topic: settings.topic.trim(),
        keywords: settings.keywords.trim(),
        requirements: settings.requirements.trim() || null,
        analysis_result: analysisResult,
        reference_text: referenceText,
        generated_content: generatedText,
        status: "completed",
        title: selectedTitle || settings.topic.trim(),
      });
    } catch {
      // Supabase save failure is non-critical
    }
  };

  const blogStreamCallbacks = useMemo(
    () => ({
      onComplete: (fullText: string) => {
        toast.success("블로그 글 생성이 완료되었습니다.");
        saveToSupabase(fullText);
      },
      onError: (msg: string) => {
        toast.error(msg);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, analysisResult, referenceText]
  );

  const {
    data: generatedContent,
    isStreaming: isGenerating,
    startStream: startBlogStream,
    abortStream: abortBlogStream,
    reset: resetBlogGeneration,
  } = useStreaming(blogStreamCallbacks);

  const convertStreamCallbacks = useMemo(
    () => ({
      onComplete: (fullText: string) => {
        const format = activeConvertTabRef.current;
        if (format) {
          setConvertResults((prev) => ({
            ...prev,
            [format]: fullText,
          }));
        }
        toast.success("콘텐츠 변환이 완료되었습니다.");
      },
      onError: (msg: string) => {
        toast.error(msg);
      },
    }),
    []
  );

  const {
    data: convertingContent,
    isStreaming: isConverting,
    startStream: startConvertStream,
    abortStream: abortConvertStream,
    reset: resetConvert,
  } = useStreaming(convertStreamCallbacks);

  const handleGenerate = () => {
    startBlogStream("/api/generate", {
      analysisResult,
      referenceText: referenceText || "(내장 템플릿 사용)",
      topic: settings.topic.trim(),
      keywords: settings.keywords.trim(),
      selectedTitle: selectedTitle || undefined,
      productName: settings.productName.trim() || undefined,
      productAdvantages: settings.productAdvantages.trim() || undefined,
      requirements: settings.requirements.trim() || undefined,
      charCountRange: settings.charCountRange,
    });
  };

  const handleConvert = (format: ConvertFormat) => {
    setActiveConvertTab(format);
    activeConvertTabRef.current = format;
    resetConvert();
    startConvertStream("/api/convert", {
      blogContent: generatedContent,
      format,
    });
  };

  const handleCopyConvert = async (format: string) => {
    const text = convertResults[format];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">글 생성</h2>
        <p className="text-sm text-muted-foreground">
          설정한 내용을 바탕으로 AI가 블로그 글을 작성합니다
        </p>
      </div>

      {/* Summary of settings */}
      <div className="rounded-md border bg-muted/30 p-4 space-y-2 max-w-lg mx-auto">
        <div className="grid grid-cols-[80px_1fr] gap-1 text-sm">
          <span className="text-muted-foreground">제목</span>
          <span className="font-medium">{selectedTitle}</span>
          <span className="text-muted-foreground">주제</span>
          <span className="font-medium">{settings.topic}</span>
          <span className="text-muted-foreground">키워드</span>
          <span className="font-medium">{settings.keywords}</span>
          {settings.productName && (
            <>
              <span className="text-muted-foreground">제품명</span>
              <span className="font-medium">{settings.productName}</span>
            </>
          )}
          {settings.productAdvantages && (
            <>
              <span className="text-muted-foreground">제품 장점</span>
              <span className="font-medium truncate">
                {settings.productAdvantages}
              </span>
            </>
          )}
          {settings.requirements && (
            <>
              <span className="text-muted-foreground">요구사항</span>
              <span className="font-medium truncate">
                {settings.requirements}
              </span>
            </>
          )}
          <span className="text-muted-foreground">글자 수</span>
          <span className="font-medium">
            {CHAR_RANGE_LABELS[settings.charCountRange] || settings.charCountRange}
          </span>
        </div>
      </div>

      {/* Blog generation */}
      <div className="flex items-center justify-center gap-3">
        {!generatedContent && !isGenerating && (
          <Button
            onClick={handleGenerate}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Wand2 className="h-4 w-4" />
            블로그 글 생성
          </Button>
        )}
        {isGenerating && (
          <>
            <Button variant="destructive" onClick={abortBlogStream}>
              생성 중단
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI가 블로그 글을 작성하고 있습니다...
            </div>
          </>
        )}
        {generatedContent && !isGenerating && (
          <>
            <Button
              variant="outline"
              onClick={() => {
                resetBlogGeneration();
                setConvertResults({});
              }}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              다시 생성
            </Button>
            <ExportDialog content={generatedContent} title={settings.topic} />
          </>
        )}
      </div>

      {/* Blog content preview */}
      {(generatedContent || isGenerating) && (
        <>
          <Separator />
          <ContentPreview content={generatedContent} isLoading={isGenerating} />
        </>
      )}

      {/* Content conversion tabs - only show after blog is generated */}
      {generatedContent && !isGenerating && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">
              콘텐츠 변환
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              생성된 블로그 글을 다른 플랫폼에 맞게 변환합니다
            </p>

            <Tabs
              value={activeConvertTab || ""}
              onValueChange={(v) => {
                const format = v as ConvertFormat;
                if (!convertResults[format] && !isConverting) {
                  handleConvert(format);
                } else {
                  setActiveConvertTab(format);
                }
              }}
            >
              <TabsList className="w-full grid grid-cols-4">
                {CONVERT_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="gap-1 text-xs sm:text-sm"
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {CONVERT_TABS.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-4">
                  {/* Converting state */}
                  {isConverting && activeConvertTab === tab.id && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {tab.label} 대본으로 변환 중...
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={abortConvertStream}
                        >
                          중단
                        </Button>
                      </div>
                      <div className="rounded-md border bg-muted/30 p-4 max-h-[400px] overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {convertingContent}
                        </pre>
                        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Result */}
                  {convertResults[tab.id] && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {tab.label} 변환 결과
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleCopyConvert(tab.id)}
                          >
                            {copiedFormat === tab.id ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleConvert(tab.id)}
                          >
                            <RotateCcw className="h-3 w-3" />
                            다시 변환
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-md border bg-muted/30 p-4 max-h-[400px] overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {convertResults[tab.id]}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Not yet converted */}
                  {!convertResults[tab.id] &&
                    !(isConverting && activeConvertTab === tab.id) && (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <p className="text-sm text-muted-foreground">
                          블로그 글을 {tab.label}용으로 변환합니다
                        </p>
                        <Button
                          onClick={() => handleConvert(tab.id)}
                          variant="outline"
                          className="gap-1.5"
                        >
                          {tab.icon}
                          변환하기
                        </Button>
                      </div>
                    )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
