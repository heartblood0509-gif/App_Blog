"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  getAllPresets,
  savePreset,
  deletePreset,
  type ProductPreset,
} from "@/lib/product-presets";
import { Save, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export type CharCountRange =
  | "500-1500"
  | "1500-2500"
  | "2500-3500"
  | "reference";

export interface GenerationSettings {
  topic: string;
  keywords: string;
  productName: string;
  productAdvantages: string;
  productLink: string;
  requirements: string;
  charCountRange: CharCountRange;
  includeImageDesc: boolean;
}

interface StepSettingsProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
}

const CHAR_COUNT_OPTIONS: {
  value: CharCountRange;
  label: string;
  desc: string;
  recommended?: boolean;
}[] = [
  { value: "500-1500", label: "500~1,500자", desc: "짧고 간결한 글" },
  {
    value: "1500-2500",
    label: "1,500~2,500자",
    desc: "블로그 상위노출 최적 분량",
  },
  { value: "2500-3500", label: "2,500~3,500자", desc: "더 깊이있는 긴 글" },
  {
    value: "reference",
    label: "레퍼런스 글자수 그대로",
    desc: "분석 결과의 글자수를 따름",
    recommended: true,
  },
];

export function StepSettings({ settings, onChange }: StepSettingsProps) {
  const [presets, setPresets] = useState<ProductPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [showPresetList, setShowPresetList] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPresets(getAllPresets());
  }, []);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!showPresetList) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) {
        setShowPresetList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPresetList]);

  const update = (key: keyof GenerationSettings, value: string) => {
    onChange({ ...settings, [key]: value });
  };

  const handleSelectPreset = (preset: ProductPreset) => {
    setSelectedPresetId(preset.id);
    setShowPresetList(false);
    onChange({
      ...settings,
      topic: preset.topic,
      productName: preset.productName,
      productAdvantages: preset.productAdvantages,
      productLink: preset.productLink,
    });
    toast.success(`"${preset.productName}" 제품 정보를 불러왔습니다.`);
  };

  const handleSavePreset = () => {
    if (!settings.productName.trim()) {
      toast.error("제품명을 입력해야 저장할 수 있습니다.");
      return;
    }
    savePreset({
      productName: settings.productName.trim(),
      productAdvantages: settings.productAdvantages.trim(),
      productLink: settings.productLink.trim(),
      topic: settings.topic.trim(),
    });
    setPresets(getAllPresets());
    toast.success(
      `"${settings.productName}" 제품 정보가 저장되었습니다.`
    );
  };

  const handleDeletePreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePreset(id);
    setPresets(getAllPresets());
    if (selectedPresetId === id) setSelectedPresetId(null);
    toast.success("제품 정보가 삭제되었습니다.");
  };

  const handleClearPreset = () => {
    setSelectedPresetId(null);
    onChange({
      ...settings,
      topic: "",
      productName: "",
      productAdvantages: "",
      productLink: "",
    });
  };

  const selectedPreset = presets.find((p) => p.id === selectedPresetId);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">글 설정</h2>
        <p className="text-base sm:text-lg text-muted-foreground">
          생성할 블로그 글의 주제와 키워드 등을 입력하세요
        </p>
      </div>

      <div className="grid gap-6 max-w-lg mx-auto">
        {/* Product preset selector */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">저장된 제품 정보</Label>
          <div className="relative" ref={presetRef}>
            <button
              type="button"
              onClick={() => setShowPresetList(!showPresetList)}
              className="w-full flex items-center justify-between rounded-md border p-3 text-base text-left hover:border-muted-foreground/30 transition-colors"
            >
              <span
                className={
                  selectedPreset
                    ? "font-semibold"
                    : "text-muted-foreground"
                }
              >
                {selectedPreset
                  ? selectedPreset.productName
                  : "제품을 선택하세요"}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${showPresetList ? "rotate-180" : ""}`}
              />
            </button>

            {showPresetList && (
              <div className="absolute z-10 w-full mt-1 rounded-md border bg-background shadow-lg max-h-[200px] overflow-y-auto">
                {presets.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    저장된 제품이 없습니다
                  </div>
                ) : (
                  presets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedPresetId === preset.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleSelectPreset(preset)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold truncate">
                          {preset.productName}
                        </p>
                        {preset.topic && (
                          <p className="text-sm text-muted-foreground truncate">
                            주제: {preset.topic}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeletePreset(e, preset.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
                {selectedPreset && (
                  <div
                    className="p-3 text-sm text-center text-muted-foreground cursor-pointer hover:bg-muted/50 border-t"
                    onClick={() => {
                      handleClearPreset();
                      setShowPresetList(false);
                    }}
                  >
                    선택 해제
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm"
              onClick={handleSavePreset}
              disabled={!settings.productName.trim()}
            >
              <Save className="h-3.5 w-3.5" />
              현재 제품 정보 저장
            </Button>
          </div>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-base font-semibold">
            주제 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="topic"
            placeholder="예: 2024 여름 스킨케어 루틴"
            value={settings.topic}
            onChange={(e) => update("topic", e.target.value)}
            className="text-base"
          />
          <p className="text-sm text-muted-foreground">
            블로그 글의 메인 주제를 입력하세요
          </p>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-base font-semibold">
            키워드 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="keywords"
            placeholder="예: 자외선 차단제, 수분크림, 여름 피부관리"
            value={settings.keywords}
            onChange={(e) => update("keywords", e.target.value)}
            className="text-base"
          />
          <p className="text-sm text-muted-foreground">
            SEO에 포함할 키워드를 쉼표로 구분하여 입력하세요
          </p>
        </div>

        {/* Product name */}
        <div className="space-y-2">
          <Label htmlFor="productName" className="text-base font-semibold">
            제품명
          </Label>
          <Input
            id="productName"
            placeholder="예: 아이오페 레티놀 슈퍼 바운스 세럼"
            value={settings.productName}
            onChange={(e) => update("productName", e.target.value)}
            className="text-base"
          />
          <p className="text-sm text-muted-foreground">
            홍보할 제품이 있다면 제품명을 입력하세요
          </p>
        </div>

        {/* Product advantages */}
        <div className="space-y-2">
          <Label
            htmlFor="productAdvantages"
            className="text-base font-semibold"
          >
            내 제품의 장점
          </Label>
          <Textarea
            id="productAdvantages"
            placeholder="예: 레티놀 성분이 피부 재생에 효과적, 민감성 피부에도 자극 없음, 가성비 좋음"
            value={settings.productAdvantages}
            onChange={(e) => update("productAdvantages", e.target.value)}
            className="min-h-[80px] resize-y text-base"
          />
          <p className="text-sm text-muted-foreground">
            제품의 강점이나 차별점을 입력하면 글에 자연스럽게 반영됩니다
          </p>
        </div>

        {/* Product link */}
        <div className="space-y-2">
          <Label htmlFor="productLink" className="text-base font-semibold">
            제품 링크
          </Label>
          <Input
            id="productLink"
            placeholder="예: https://smartstore.naver.com/brand/products/12345"
            value={settings.productLink}
            onChange={(e) => update("productLink", e.target.value)}
            className="text-base"
          />
          <p className="text-sm text-muted-foreground">
            {settings.productLink.trim()
              ? "글 하단에 구매 링크가 자연스럽게 포함됩니다"
              : "링크를 비워두면 제품명만 언급하고 링크는 생성하지 않습니다"}
          </p>
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <Label htmlFor="requirements" className="text-base font-semibold">
            추가 요구사항
          </Label>
          <Textarea
            id="requirements"
            placeholder="예: 20대 여성 타겟, 친근한 말투, 전후 사진 언급 포함"
            value={settings.requirements}
            onChange={(e) => update("requirements", e.target.value)}
            className="min-h-[80px] resize-y text-base"
          />
          <p className="text-sm text-muted-foreground">
            글의 톤, 타겟 독자, 특별히 포함할 내용 등을 자유롭게 입력하세요
          </p>
        </div>

        {/* Character count range */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            글자 수 설정 <span className="text-destructive">*</span>
          </Label>
          <div className="grid gap-2.5">
            {CHAR_COUNT_OPTIONS.map((option) => {
              const isSelected = settings.charCountRange === option.value;
              const isRecommended = option.recommended;
              return (
                <label
                  key={option.value}
                  className={`relative flex items-center gap-3 rounded-md border p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? isRecommended
                        ? "border-green-500 bg-green-500/10"
                        : "border-primary bg-primary/5"
                      : isRecommended
                        ? "border-green-500/40 bg-green-500/5 hover:border-green-500/60"
                        : "hover:border-muted-foreground/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="charCountRange"
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) => update("charCountRange", e.target.value)}
                    className="accent-green-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold">
                        {option.label}
                      </span>
                      {isRecommended && (
                        <span className="text-xs font-bold text-green-500 bg-green-500/15 px-1.5 py-0.5 rounded">
                          추천
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${isRecommended ? "text-green-500/80" : "text-muted-foreground"}`}
                    >
                      {option.desc}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Image description toggle */}
        <div className="space-y-2">
          <label className="flex items-center gap-3 rounded-md border p-3.5 cursor-pointer transition-colors hover:border-muted-foreground/30">
            <input
              type="checkbox"
              checked={settings.includeImageDesc}
              onChange={(e) =>
                onChange({ ...settings, includeImageDesc: e.target.checked })
              }
              className="accent-primary w-4 h-4"
            />
            <div>
              <span className="text-base font-semibold">이미지 설명 포함</span>
              <p className="text-sm text-muted-foreground">
                {settings.includeImageDesc
                  ? "[이미지: 설명] 형태로 이미지 위치와 설명을 표시합니다"
                  : "이미지 위치에 빈 공간만 표시합니다 (설명 없음)"}
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
