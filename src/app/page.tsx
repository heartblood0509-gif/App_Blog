"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  StepContentType,
  type ContentType,
} from "@/components/project/step-content-type";
import {
  StepAnalysis,
  type AnalysisMode,
} from "@/components/project/step-analysis";
import {
  StepSettings,
  type GenerationSettings,
} from "@/components/project/step-settings";
import { StepTitle } from "@/components/project/step-title";
import { StepGenerate } from "@/components/project/step-generate";
import {
  StepThreadsSettings,
  type ThreadsSettings,
} from "@/components/project/step-threads-settings";
import { StepThreadsGenerate } from "@/components/project/step-threads-generate";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const BLOG_STEPS = [
  { label: "콘텐츠 유형", description: "블로그 또는 쓰레드 선택" },
  { label: "분석 방식", description: "템플릿 활용 또는 레퍼런스 글 분석" },
  { label: "글 설정", description: "주제, 키워드, 글자수 설정" },
  { label: "제목 선택", description: "AI 추천 제목 선택" },
  { label: "생성 & 변환", description: "블로그 글 생성 + 콘텐츠 변환" },
];

const THREADS_STEPS = [
  { label: "콘텐츠 유형", description: "블로그 또는 쓰레드 선택" },
  { label: "분석 방식", description: "템플릿 활용 또는 레퍼런스 분석" },
  { label: "글 설정", description: "추가 요구사항 설정" },
  { label: "쓰레드 생성", description: "설정 기반 쓰레드 작성" },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">(
    "forward"
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Content type
  const [contentType, setContentType] = useState<ContentType | null>(null);

  // Blog states
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [settings, setSettings] = useState<GenerationSettings>({
    topic: "",
    keywords: "",
    productName: "",
    productAdvantages: "",
    productLink: "",
    requirements: "",
    charCountRange: "reference",
    includeImageDesc: false,
  });

  // Threads states
  const [threadsSettings, setThreadsSettings] = useState<ThreadsSettings>({
    topic: "",
    requirements: "",
  });

  const steps = contentType === "threads" ? THREADS_STEPS : BLOG_STEPS;

  const handleAnalysisComplete = useCallback(
    (analysis: string, refText: string) => {
      setAnalysisResult(analysis);
      setReferenceText(refText);
    },
    []
  );

  const canGoNext = () => {
    if (currentStep === 0) return contentType !== null;

    if (contentType === "blog") {
      if (currentStep === 1) return !!analysisResult;
      if (currentStep === 2)
        return (
          settings.topic.trim() !== "" && settings.keywords.trim() !== ""
        );
      if (currentStep === 3) return selectedTitle.trim() !== "";
      return false;
    }

    if (contentType === "threads") {
      if (currentStep === 1) return !!analysisResult;
      if (currentStep === 2) {
        // Image mode requires topic
        if (analysisMode === "image") return threadsSettings.topic.trim() !== "";
        return true; // article mode: requirements are optional
      }
      return false;
    }

    return false;
  };

  const goToStep = (next: number, dir: "forward" | "backward") => {
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(next);
      setIsAnimating(false);
    }, 150);
  };

  // Reset scroll on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const animationClass = isAnimating
    ? direction === "forward"
      ? "opacity-0 translate-x-8"
      : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0";

  const handleBack = () => {
    if (currentStep === 0) return;
    if (currentStep === 1 && analysisMode !== null) {
      setAnalysisMode(null);
      return;
    }
    goToStep(currentStep - 1, "backward");
  };

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <StepContentType
          selected={contentType}
          onSelect={(type) => {
            setContentType(type);
            setTimeout(() => goToStep(1, "forward"), 300);
          }}
        />
      );
    }

    if (contentType === "blog") {
      switch (currentStep) {
        case 1:
          return (
            <StepAnalysis
              onComplete={handleAnalysisComplete}
              mode={analysisMode}
              onModeChange={setAnalysisMode}
            />
          );
        case 2:
          return (
            <StepSettings settings={settings} onChange={setSettings} />
          );
        case 3:
          return (
            <StepTitle
              analysisResult={analysisResult}
              topic={settings.topic}
              keywords={settings.keywords}
              selectedTitle={selectedTitle}
              onSelectTitle={(title) => {
                setSelectedTitle(title);
                if (title.trim()) {
                  setTimeout(() => goToStep(4, "forward"), 400);
                }
              }}
            />
          );
        case 4:
          return (
            <StepGenerate
              analysisResult={analysisResult}
              referenceText={referenceText}
              settings={settings}
              selectedTitle={selectedTitle}
              onNewTitle={() => {
                setSelectedTitle("");
                goToStep(3, "backward");
              }}
              onRestart={() => {
                setCurrentStep(0);
                setContentType(null);
                setAnalysisMode(null);
                setAnalysisResult("");
                setReferenceText("");
                setSelectedTitle("");
                setSettings({
                  topic: "",
                  keywords: "",
                  productName: "",
                  productAdvantages: "",
                  productLink: "",
                  requirements: "",
                  charCountRange: "reference",
                  includeImageDesc: false,
                });
              }}
            />
          );
      }
    }

    if (contentType === "threads") {
      switch (currentStep) {
        case 1:
          return (
            <StepAnalysis
              onComplete={handleAnalysisComplete}
              mode={analysisMode}
              onModeChange={setAnalysisMode}
              contentType="threads"
            />
          );
        case 2:
          return (
            <StepThreadsSettings
              settings={threadsSettings}
              onChange={setThreadsSettings}
              analysisMode={analysisMode}
            />
          );
        case 3:
          return (
            <StepThreadsGenerate
              articleText={referenceText}
              analysisResult={analysisResult}
              analysisMode={analysisMode}
              settings={threadsSettings}
            />
          );
      }
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Stepper indicator */}
      <div className="mb-10">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div
                key={`${step.label}-${index}`}
                className="flex items-center flex-1 last:flex-none"
              >
                {/* Step circle + label */}
                <div className="flex flex-col items-center min-w-[70px] sm:min-w-[100px]">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-base sm:text-lg font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-600 text-white scale-100"
                        : isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105"
                          : "bg-muted text-muted-foreground scale-100"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2.5 text-center">
                    <p
                      className={`text-base sm:text-lg font-bold transition-colors duration-300 ${
                        isCurrent
                          ? "text-foreground"
                          : isCompleted
                            ? "text-green-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-sm text-muted-foreground hidden sm:block mt-1 min-h-[2.5rem]">
                      {step.description}
                    </p>
                  </div>
                </div>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-1 sm:mx-3 -mt-14">
                    <div className="h-0.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: index < currentStep ? "100%" : "0%",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content with animation */}
      <Card>
        <CardContent className="p-6 sm:p-10 overflow-hidden">
          <div
            ref={contentRef}
            className={`transition-all duration-300 ease-out ${animationClass}`}
          >
            {renderStep()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isAnimating}
          className="gap-2 text-base px-5 py-2.5"
        >
          <ChevronLeft className="h-5 w-5" />
          이전
        </Button>

        <span className="text-base font-medium text-muted-foreground">
          {currentStep + 1} / {steps.length}
        </span>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={() => goToStep(currentStep + 1, "forward")}
            disabled={!canGoNext() || isAnimating}
            className="gap-2 text-base px-5 py-2.5"
          >
            다음
            <ChevronRight className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-[100px]" />
        )}
      </div>
    </div>
  );
}
