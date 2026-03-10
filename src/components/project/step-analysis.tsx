"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CrawlInput } from "./crawl-input";
import { FileUpload } from "./file-upload";
import { AnalysisDisplay } from "./analysis-display";
import { useStreaming } from "@/hooks/use-streaming";
import {
  getAllTemplates,
  saveTemplate,
  deleteTemplate,
  type AnalysisTemplate,
} from "@/lib/templates";
import {
  BookOpen,
  Search,
  Loader2,
  FileText,
  Globe,
  Check,
  ChevronRight,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type AnalysisMode = "template" | "crawl" | null;

interface StepAnalysisProps {
  onComplete: (analysisResult: string, referenceText: string) => void;
}

export function StepAnalysis({ onComplete }: StepAnalysisProps) {
  const [mode, setMode] = useState<AnalysisMode>(null);
  const [referenceText, setReferenceText] = useState("");
  const [platform, setPlatform] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<AnalysisTemplate[]>([]);

  // Save-as-template dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");

  useEffect(() => {
    setTemplates(getAllTemplates());
  }, []);

  const refreshTemplates = () => {
    setTemplates(getAllTemplates());
  };

  const {
    data: analysisResult,
    isStreaming: isAnalyzing,
    startStream,
    abortStream,
  } = useStreaming({
    onComplete: (fullText: string) => {
      onComplete(fullText, referenceText);
      toast.success("구조 분석이 완료되었습니다.");
    },
    onError: (msg: string) => {
      toast.error(msg);
    },
  });

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setMode("template");
      onComplete(template.analysisResult, "");
      toast.success(`"${template.name}" 템플릿이 선택되었습니다.`);
    }
  };

  const handleDeleteTemplate = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    deleteTemplate(templateId);
    refreshTemplates();
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null);
    }
    toast.success("템플릿이 삭제되었습니다.");
  };

  const handleCrawled = (title: string, content: string, plat: string) => {
    const text = title ? `# ${title}\n\n${content}` : content;
    setReferenceText(text);
    setPlatform(plat);
    toast.success(`${plat} 크롤링 완료`);
  };

  const handleAnalyze = () => {
    if (referenceText.trim().length < 50) {
      toast.error("분석할 텍스트는 최소 50자 이상이어야 합니다.");
      return;
    }
    startStream("/api/analyze", { referenceText: referenceText.trim() });
  };

  const handleSaveAsTemplate = () => {
    if (!saveName.trim()) {
      toast.error("템플릿 이름을 입력해주세요.");
      return;
    }
    if (!analysisResult) {
      toast.error("저장할 분석 결과가 없습니다.");
      return;
    }
    saveTemplate({
      name: saveName.trim(),
      description: saveDescription.trim() || "사용자 저장 템플릿",
      analysisResult,
    });
    refreshTemplates();
    setShowSaveDialog(false);
    setSaveName("");
    setSaveDescription("");
    toast.success("분석 결과가 템플릿으로 저장되었습니다.");
  };

  // Mode selection
  if (!mode) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">분석 방식을 선택하세요</h2>
          <p className="text-sm text-muted-foreground">
            저장된 템플릿을 활용하거나, 레퍼런스 글을 직접 분석할 수 있습니다
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            className="cursor-pointer hover:border-blue-500/50 transition-colors group"
            onClick={() => setMode("template")}
          >
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">템플릿 활용 (추천)</h3>
              <p className="text-sm text-muted-foreground">
                미리 분석된 글 스타일을 선택하여 바로 글을 생성합니다
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-green-500/50 transition-colors group"
            onClick={() => setMode("crawl")}
          >
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <Globe className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-1">레퍼런스 글 분석</h3>
              <p className="text-sm text-muted-foreground">
                블로그 URL을 크롤링하거나 텍스트를 붙여넣어 AI가 분석합니다
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Template selection mode
  if (mode === "template") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMode(null);
              setSelectedTemplate(null);
            }}
          >
            ← 돌아가기
          </Button>
          <h3 className="font-semibold">템플릿 선택</h3>
        </div>

        <div className="grid gap-3">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/5"
                    : "hover:border-blue-500/30"
                }`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.isBuiltIn && (
                        <Badge variant="outline" className="text-xs">
                          기본
                        </Badge>
                      )}
                      {isSelected && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          선택됨
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {!template.isBuiltIn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteTemplate(e, template.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedTemplate && (
          <p className="text-sm text-center text-green-500 font-medium">
            템플릿이 선택되었습니다. 다음 단계로 이동하세요.
          </p>
        )}
      </div>
    );
  }

  // Crawl/paste analysis mode
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
          ← 돌아가기
        </Button>
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-green-500" />
          레퍼런스 글 분석
        </h3>
        {platform && (
          <Badge variant="secondary" className="text-xs">
            {platform}
          </Badge>
        )}
      </div>

      <CrawlInput
        onCrawled={handleCrawled}
        onError={(msg) => toast.error(msg)}
        disabled={isAnalyzing}
      />

      <div className="flex items-center gap-2">
        <FileUpload
          onFileLoaded={(content, filename) => {
            setReferenceText(content);
            setPlatform(null);
            toast.success(`${filename} 파일을 불러왔습니다.`);
          }}
          onError={(msg) => toast.error(msg)}
          disabled={isAnalyzing}
        />
        <span className="text-xs text-muted-foreground">
          또는 아래에 직접 텍스트를 붙여넣기
        </span>
      </div>

      <Textarea
        placeholder="레퍼런스 블로그 글을 여기에 붙여넣으세요..."
        value={referenceText}
        onChange={(e) => setReferenceText(e.target.value)}
        className="h-[200px] max-h-[200px] overflow-y-auto resize-none font-mono text-sm"
        disabled={isAnalyzing}
      />
      {referenceText && (
        <div className="text-xs text-muted-foreground">
          {referenceText.replace(/\s/g, "").length.toLocaleString()}자 (공백
          제외) / {referenceText.length.toLocaleString()}자 (공백 포함)
        </div>
      )}

      <div className="flex gap-2">
        {isAnalyzing ? (
          <Button variant="destructive" onClick={abortStream} size="sm">
            분석 중단
          </Button>
        ) : (
          <Button
            onClick={handleAnalyze}
            disabled={referenceText.trim().length < 50}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Search className="h-3.5 w-3.5" />
            구조 분석
          </Button>
        )}
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            AI가 글 구조를 분석하고 있습니다...
          </div>
        )}
      </div>

      {(analysisResult || isAnalyzing) && (
        <>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-500">분석 결과</h4>
              {analysisResult && !isAnalyzing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-xs"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="h-3 w-3" />
                  템플릿으로 저장
                </Button>
              )}
            </div>
            <AnalysisDisplay content={analysisResult} isLoading={isAnalyzing} />
          </div>

          {/* Save as template dialog */}
          {showSaveDialog && (
            <>
              <Separator />
              <div className="space-y-3 rounded-md border p-4 bg-muted/30">
                <h4 className="text-sm font-medium">템플릿으로 저장</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="템플릿 이름 (예: 정보성 리뷰형)"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                  />
                  <Input
                    placeholder="간단한 설명 (선택)"
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveAsTemplate}
                    disabled={!saveName.trim()}
                    className="gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    저장
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowSaveDialog(false);
                      setSaveName("");
                      setSaveDescription("");
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            </>
          )}

          {analysisResult && !isAnalyzing && (
            <p className="text-sm text-center text-green-500 font-medium">
              분석이 완료되었습니다. 다음 단계로 이동하세요.
            </p>
          )}
        </>
      )}
    </div>
  );
}
