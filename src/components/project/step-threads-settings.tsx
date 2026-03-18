"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface ThreadsSettings {
  newsUrl: string;
  requirements: string;
}

interface StepThreadsSettingsProps {
  settings: ThreadsSettings;
  onChange: (settings: ThreadsSettings) => void;
}

export function StepThreadsSettings({
  settings,
  onChange,
}: StepThreadsSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
          쓰레드 설정
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground">
          변환할 뉴스 기사 링크와 요구사항을 입력하세요
        </p>
      </div>

      <div className="grid gap-6 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label htmlFor="newsUrl" className="text-base font-semibold">
            뉴스 기사 링크 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="newsUrl"
            placeholder="예: https://news.example.com/article/12345"
            value={settings.newsUrl}
            onChange={(e) =>
              onChange({ ...settings, newsUrl: e.target.value })
            }
            className="text-base"
          />
          <p className="text-sm text-muted-foreground">
            쓰레드로 변환할 뉴스 기사의 URL을 입력하세요
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="threadsRequirements"
            className="text-base font-semibold"
          >
            추가 요구사항
          </Label>
          <Textarea
            id="threadsRequirements"
            placeholder="예: 20대 타겟, 특정 관점 강조, 특정 정보 포함 등"
            value={settings.requirements}
            onChange={(e) =>
              onChange({ ...settings, requirements: e.target.value })
            }
            className="min-h-[80px] resize-y text-base"
          />
          <p className="text-sm text-muted-foreground">
            쓰레드 작성 시 특별히 반영할 내용을 자유롭게 입력하세요
          </p>
        </div>
      </div>
    </div>
  );
}
