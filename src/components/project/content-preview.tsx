"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Copy, Check, Eye, Code } from "lucide-react";

interface ContentPreviewProps {
  content: string;
  isLoading: boolean;
}

export function ContentPreview({ content, isLoading }: ContentPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");

  // 마크다운 → 네이버 블로그용 HTML 변환 (소제목 폰트 크기 + 문단 간격 보존)
  const markdownToNaverHtml = (text: string): string => {
    const lines = text.split("\n");
    const htmlLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // [이미지: ...] → 빈 줄 2개 (사진 공간)
      if (/^\[이미지:[^\]]*\]$/.test(trimmed)) {
        htmlLines.push("<p><br></p><p><br></p>");
        continue;
      }
      // 수평선(----) → 빈 줄 2개 (섹션 구분)
      if (/^-{3,}$/.test(trimmed)) {
        htmlLines.push("<p><br></p><p><br></p>");
        continue;
      }
      // 빈 줄 → 줄바꿈
      if (trimmed === "") {
        htmlLines.push("<p><br></p>");
        continue;
      }
      // H1 제목 → 28px 볼드
      if (/^# /.test(line)) {
        const heading = line.replace(/^# /, "").replace(/\*\*([\s\S]+?)\*\*/g, "$1");
        htmlLines.push(`<p style="font-size:28px"><b>${heading}</b></p><p><br></p>`);
        continue;
      }
      // H2 소제목 → 22px 볼드
      if (/^## /.test(line)) {
        const heading = line.replace(/^## /, "").replace(/\*\*([\s\S]+?)\*\*/g, "$1");
        htmlLines.push(`<p><br></p><p style="font-size:22px"><b>${heading}</b></p><p><br></p>`);
        continue;
      }
      // H3 소소제목 → 19px 볼드
      if (/^### /.test(line)) {
        const heading = line.replace(/^### /, "").replace(/\*\*([\s\S]+?)\*\*/g, "$1");
        htmlLines.push(`<p style="font-size:19px"><b>${heading}</b></p>`);
        continue;
      }
      // 일반 텍스트 → 15px + 볼드/이탤릭 처리 + 링크 텍스트만
      let processed = trimmed
        .replace(/\*\*\*([\s\S]+?)\*\*\*/g, "<b><i>$1</i></b>")
        .replace(/\*\*([\s\S]+?)\*\*/g, "<b>$1</b>")
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<i>$1</i>")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/^[-*+]\s+/, "")
        .replace(/^\d+\.\s+/, "");
      htmlLines.push(`<p style="font-size:15px">${processed}</p>`);
    }

    return htmlLines.join("");
  };

  const handleCopy = async () => {
    const html = markdownToNaverHtml(content);
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plainText.trim()], { type: "text/plain" }),
        }),
      ]);
    } catch {
      // ClipboardItem 미지원 브라우저 폴백
      await navigator.clipboard.writeText(plainText.trim());
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 마크다운 → 순수 텍스트 변환 (글자수 카운트용)
  const stripMarkdown = (text: string): string =>
    text
      .replace(/\[이미지:[^\]]*\]/g, "")
      .replace(/^-{3,}$/gm, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*\*([\s\S]+?)\*\*\*/g, "$1")
      .replace(/\*\*([\s\S]+?)\*\*/g, "$1")
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/~~([\s\S]+?)~~/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n{3,}/g, "\n\n");

  const plainText = content ? stripMarkdown(content) : "";
  const textWithoutImageTags = plainText.replace(/\[이미지:[^\]]*\]/g, "");
  const charCountWithSpaces = textWithoutImageTags.length;
  const charCountNoSpaces = textWithoutImageTags.replace(/\s/g, "").length;

  if (isLoading && !content) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
        생성된 콘텐츠가 여기에 표시됩니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("preview")}
            className="h-7 px-2 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            미리보기
          </Button>
          <Button
            variant={viewMode === "raw" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("raw")}
            className="h-7 px-2 text-xs"
          >
            <Code className="h-3 w-3 mr-1" />
            마크다운
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {charCountNoSpaces.toLocaleString()}자 (공백 제외) / {charCountWithSpaces.toLocaleString()}자 (공백 포함)
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px] rounded-md border bg-muted/30 p-5">
        {viewMode === "preview" ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-5 pb-3 border-b leading-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl sm:text-2xl font-bold mt-8 mb-3 leading-snug">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2 leading-snug">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-base leading-relaxed mb-3">{children}</p>
                ),
                li: ({ children }) => (
                  <li className="text-base leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-foreground">{children}</strong>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="text-sm whitespace-pre-wrap font-mono">{content}</pre>
        )}
        {isLoading && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
        )}
      </ScrollArea>
    </div>
  );
}
