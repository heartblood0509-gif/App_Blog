"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type CharCountRange = "1500-2500" | "2500-3500" | "reference";

export interface GenerationSettings {
  topic: string;
  keywords: string;
  productName: string;
  productAdvantages: string;
  requirements: string;
  charCountRange: CharCountRange;
}

interface StepSettingsProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
}

const CHAR_COUNT_OPTIONS: { value: CharCountRange; label: string; desc: string }[] = [
  { value: "1500-2500", label: "1,500~2,500자", desc: "추천 - 블로그 상위노출 최적 분량" },
  { value: "2500-3500", label: "2,500~3,500자", desc: "더 깊이있는 긴 글" },
  { value: "reference", label: "레퍼런스 글자수 그대로", desc: "분석 결과의 글자수를 따름" },
];

export function StepSettings({ settings, onChange }: StepSettingsProps) {
  const update = (key: keyof GenerationSettings, value: string) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">글 설정</h2>
        <p className="text-sm text-muted-foreground">
          생성할 블로그 글의 주제와 키워드 등을 입력하세요
        </p>
      </div>

      <div className="grid gap-5 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-sm font-medium">
            주제 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="topic"
            placeholder="예: 2024 여름 스킨케어 루틴"
            value={settings.topic}
            onChange={(e) => update("topic", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            블로그 글의 메인 주제를 입력하세요
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-sm font-medium">
            키워드 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="keywords"
            placeholder="예: 자외선 차단제, 수분크림, 여름 피부관리"
            value={settings.keywords}
            onChange={(e) => update("keywords", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            SEO에 포함할 키워드를 쉼표로 구분하여 입력하세요
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productName" className="text-sm font-medium">
            제품명
          </Label>
          <Input
            id="productName"
            placeholder="예: 아이오페 레티놀 슈퍼 바운스 세럼"
            value={settings.productName}
            onChange={(e) => update("productName", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            홍보할 제품이 있다면 제품명을 입력하세요
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productAdvantages" className="text-sm font-medium">
            내 제품의 장점
          </Label>
          <Textarea
            id="productAdvantages"
            placeholder="예: 레티놀 성분이 피부 재생에 효과적, 민감성 피부에도 자극 없음, 가성비 좋음"
            value={settings.productAdvantages}
            onChange={(e) => update("productAdvantages", e.target.value)}
            className="min-h-[80px] resize-y"
          />
          <p className="text-xs text-muted-foreground">
            제품의 강점이나 차별점을 입력하면 글에 자연스럽게 반영됩니다
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements" className="text-sm font-medium">
            추가 요구사항
          </Label>
          <Textarea
            id="requirements"
            placeholder="예: 20대 여성 타겟, 친근한 말투, 전후 사진 언급 포함"
            value={settings.requirements}
            onChange={(e) => update("requirements", e.target.value)}
            className="min-h-[80px] resize-y"
          />
          <p className="text-xs text-muted-foreground">
            글의 톤, 타겟 독자, 특별히 포함할 내용 등을 자유롭게 입력하세요
          </p>
        </div>

        {/* Character count range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            글자 수 설정 <span className="text-destructive">*</span>
          </Label>
          <div className="grid gap-2">
            {CHAR_COUNT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                  settings.charCountRange === option.value
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/30"
                }`}
              >
                <input
                  type="radio"
                  name="charCountRange"
                  value={option.value}
                  checked={settings.charCountRange === option.value}
                  onChange={(e) => update("charCountRange", e.target.value)}
                  className="accent-primary"
                />
                <div>
                  <span className="text-sm font-medium">{option.label}</span>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
