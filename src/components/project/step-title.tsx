"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, RefreshCw, Loader2, PenLine } from "lucide-react";
import { toast } from "sonner";

interface StepTitleProps {
  analysisResult: string;
  topic: string;
  keywords: string;
  selectedTitle: string;
  onSelectTitle: (title: string) => void;
}

export function StepTitle({
  analysisResult,
  topic,
  keywords,
  selectedTitle,
  onSelectTitle,
}: StepTitleProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/suggest-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisResult, topic, keywords }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "제목 추천에 실패했습니다.");
      }

      const data = await res.json();
      setSuggestions(data.titles || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "제목 추천 오류";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [analysisResult, topic, keywords]);

  // Auto-fetch on mount
  useEffect(() => {
    if (suggestions.length === 0 && !isLoading) {
      fetchSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSuggestion = (title: string) => {
    setUseCustom(false);
    setCustomTitle("");
    onSelectTitle(title);
  };

  const handleCustomTitleChange = (value: string) => {
    setCustomTitle(value);
    if (value.trim()) {
      setUseCustom(true);
      onSelectTitle(value.trim());
    } else {
      setUseCustom(false);
      // If no suggestion is selected either, clear
      if (!suggestions.includes(selectedTitle)) {
        onSelectTitle("");
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">제목 선택</h2>
        <p className="text-sm text-muted-foreground">
          AI가 추천한 제목 중 하나를 선택하거나 직접 입력하세요
        </p>
      </div>

      {/* AI Suggestions */}
      <div className="max-w-lg mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">AI 추천 제목</Label>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs"
            onClick={fetchSuggestions}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            다시 추천
          </Button>
        </div>

        {isLoading && suggestions.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        ) : (
          <div className="grid gap-2">
            {suggestions.map((title, index) => {
              const isSelected = !useCustom && selectedTitle === title;
              return (
                <Card
                  key={`${title}-${index}`}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => handleSelectSuggestion(title)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-sm ${isSelected ? "font-medium" : ""}`}
                    >
                      {title}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Custom title input */}
        <div className="pt-3 space-y-2">
          <Label
            htmlFor="customTitle"
            className="text-sm font-medium flex items-center gap-1.5"
          >
            <PenLine className="h-3.5 w-3.5" />
            직접 입력
          </Label>
          <Input
            id="customTitle"
            placeholder="원하는 제목을 직접 입력하세요"
            value={customTitle}
            onChange={(e) => handleCustomTitleChange(e.target.value)}
            className={
              useCustom ? "border-primary ring-1 ring-primary/20" : ""
            }
          />
          {useCustom && customTitle.trim() && (
            <p className="text-xs text-primary font-medium">
              직접 입력한 제목이 사용됩니다
            </p>
          )}
        </div>

        {selectedTitle && (
          <div className="pt-2 text-sm text-center text-green-500 font-medium">
            제목이 선택되었습니다. 다음 단계로 이동하세요.
          </div>
        )}
      </div>
    </div>
  );
}
