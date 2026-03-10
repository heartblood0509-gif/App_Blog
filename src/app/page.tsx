"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepAnalysis } from "@/components/project/step-analysis";
import { StepSettings, type GenerationSettings } from "@/components/project/step-settings";
import { StepTitle } from "@/components/project/step-title";
import { StepGenerate } from "@/components/project/step-generate";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  { label: "분석 방식", description: "템플릿 활용 또는 레퍼런스 글 분석" },
  { label: "글 설정", description: "주제, 키워드, 글자수 설정" },
  { label: "제목 선택", description: "AI 추천 제목 선택" },
  { label: "생성 & 변환", description: "블로그 글 생성 + 콘텐츠 변환" },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [settings, setSettings] = useState<GenerationSettings>({
    topic: "",
    keywords: "",
    productName: "",
    productAdvantages: "",
    requirements: "",
    charCountRange: "1500-2500",
  });

  const handleAnalysisComplete = useCallback(
    (analysis: string, refText: string) => {
      setAnalysisResult(analysis);
      setReferenceText(refText);
    },
    []
  );

  const canGoNext = () => {
    if (currentStep === 0) return !!analysisResult;
    if (currentStep === 1)
      return settings.topic.trim() !== "" && settings.keywords.trim() !== "";
    if (currentStep === 2) return selectedTitle.trim() !== "";
    return false;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Stepper indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div key={step.label} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-3 mt-[-1.5rem] ${
                      index < currentStep ? "bg-green-600" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && (
            <StepAnalysis onComplete={handleAnalysisComplete} />
          )}
          {currentStep === 1 && (
            <StepSettings settings={settings} onChange={setSettings} />
          )}
          {currentStep === 2 && (
            <StepTitle
              analysisResult={analysisResult}
              topic={settings.topic}
              keywords={settings.keywords}
              selectedTitle={selectedTitle}
              onSelectTitle={setSelectedTitle}
            />
          )}
          {currentStep === 3 && (
            <StepGenerate
              analysisResult={analysisResult}
              referenceText={referenceText}
              settings={settings}
              selectedTitle={selectedTitle}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </Button>

        <span className="text-sm text-muted-foreground">
          {currentStep + 1} / {STEPS.length}
        </span>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canGoNext()}
            className="gap-1.5"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-[80px]" />
        )}
      </div>
    </div>
  );
}
