/**
 * 이미지 마커 주입기.
 *
 * 창작 단계(Pass 1)에서는 [이미지: ...] 마커 얘기를 일절 하지 않는다.
 * AI는 본문만 쓰고, 이 모듈이 레퍼런스 분석의 "🖼️ 이미지 전략 분석" 테이블을
 * 파싱해서 draft에 규칙 기반으로 마커를 박아넣는다.
 *
 * 파싱 실패 또는 마커 주입 불가 상황에서는 호출자가 LLM 폴백 프롬프트를 사용할 수 있다.
 */

export type ImagePlan = {
  /** 테이블의 "서사 단계" 열 */
  stage: string;
  /** 테이블의 "이미지 역할" 열 */
  role: string;
  /** 테이블의 "이미지 설명" 열 — [이미지: ...] 마커에 들어감 */
  description: string;
};

/**
 * analysisResult에서 "이미지 배치 계획" 마크다운 테이블을 파싱한다.
 * 테이블 헤더: | 순서 | 서사 단계 | 이미지 역할 | 이미지 설명 |
 */
export function parseImagePlan(analysisResult: string): ImagePlan[] {
  const planSectionStart = analysisResult.indexOf("이미지 배치 계획");
  if (planSectionStart === -1) return [];

  // "이미지 배치 계획" 섹션 이후 첫 번째 다음 ### 헤더까지 자른다
  const afterHeader = analysisResult.slice(planSectionStart);
  const nextSectionMatch = afterHeader.slice(1).search(/\n###\s/);
  const section =
    nextSectionMatch === -1
      ? afterHeader
      : afterHeader.slice(0, nextSectionMatch + 1);

  const lines = section.split("\n");
  const plans: ImagePlan[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;

    // 구분선("|------|")은 스킵
    if (/^\|[\s\-|:]+\|$/.test(trimmed)) continue;

    const cells = trimmed
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cells.length < 4) continue;

    const [idxCell, stage, role, description] = cells;

    // 헤더 행 스킵 (첫 셀이 "순서" 등)
    if (!/^\d+$/.test(idxCell)) continue;

    if (!description) continue;

    plans.push({ stage, role, description });
  }

  return plans;
}

/**
 * draft(마크다운)에 이미지 마커를 규칙 기반으로 삽입한다.
 *
 * 전략:
 *   1. 첫 번째 plan → H1 바로 아래
 *   2. 이후 plan들 → 각 H2 바로 아래 순서대로
 *   3. H2 개수보다 plan이 더 많으면 남는 plan은 가장 긴 본문 블록 중간에 분산
 *   4. H2가 더 많으면 일부 H2는 마커 없음 (괜찮음, 필수 아님)
 *
 * 반환: { text, markerCount }. markerCount가 0이면 호출자가 LLM 폴백 고려.
 */
export function injectImageMarkers(
  draft: string,
  plans: ImagePlan[]
): { text: string; markerCount: number } {
  if (plans.length === 0) return { text: draft, markerCount: 0 };

  const lines = draft.split("\n");
  const output: string[] = [];
  let planIdx = 0;
  let insertedAfterH1 = false;

  const markerLine = (desc: string) => `\n[이미지: ${desc}]\n`;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    output.push(line);

    // H1 바로 아래에 첫 이미지
    if (!insertedAfterH1 && /^#\s+/.test(line) && planIdx < plans.length) {
      output.push(markerLine(plans[planIdx].description));
      planIdx++;
      insertedAfterH1 = true;
      continue;
    }

    // 각 H2 아래에 다음 이미지
    if (/^##\s+/.test(line) && planIdx < plans.length) {
      output.push(markerLine(plans[planIdx].description));
      planIdx++;
      continue;
    }
  }

  let text = output.join("\n");
  let markerCount = planIdx;

  // 남는 plan이 있으면 긴 본문 블록 끝에 분산 삽입
  while (planIdx < plans.length) {
    const inserted = insertAtLongestTextBlock(
      text,
      plans[planIdx].description
    );
    if (!inserted) break;
    text = inserted;
    planIdx++;
    markerCount++;
  }

  return { text, markerCount };
}

/**
 * 공백 제외 길이가 가장 긴 텍스트 블록(연속된 일반 문단)을 찾아
 * 그 중간쯤에 [이미지: ...] 마커를 삽입한다.
 * 삽입할 블록이 없으면 null 반환.
 */
function insertAtLongestTextBlock(text: string, description: string): string | null {
  const lines = text.split("\n");
  type Block = { start: number; end: number; chars: number };
  const blocks: Block[] = [];

  let blockStart = -1;
  let blockChars = 0;
  const isPlainLine = (line: string) => {
    const t = line.trim();
    if (!t) return false;
    if (t.startsWith("#")) return false;
    if (t.startsWith("[이미지:")) return false;
    if (t.startsWith(">")) return false;
    return true;
  };

  for (let i = 0; i < lines.length; i++) {
    if (isPlainLine(lines[i])) {
      if (blockStart === -1) blockStart = i;
      blockChars += lines[i].replace(/\s/g, "").length;
    } else {
      if (blockStart !== -1) {
        blocks.push({ start: blockStart, end: i - 1, chars: blockChars });
        blockStart = -1;
        blockChars = 0;
      }
    }
  }
  if (blockStart !== -1) {
    blocks.push({
      start: blockStart,
      end: lines.length - 1,
      chars: blockChars,
    });
  }

  if (blocks.length === 0) return null;

  // 가장 긴 블록 중간에 삽입
  blocks.sort((a, b) => b.chars - a.chars);
  const target = blocks[0];
  if (target.chars < 300) return null; // 너무 짧으면 주입 안 함

  const mid = Math.floor((target.start + target.end) / 2);
  const next = [
    ...lines.slice(0, mid + 1),
    "",
    `[이미지: ${description}]`,
    "",
    ...lines.slice(mid + 1),
  ];
  return next.join("\n");
}

/**
 * 규칙 기반 주입이 실패했거나 마커 계획이 전혀 없을 때 쓰는 LLM 폴백 프롬프트.
 * Gemini에 이 프롬프트만 보내면 draft에 [이미지: ...] 마커만 추가해서 반환.
 */
export function buildImageInjectionPrompt(draft: string): string {
  return `당신은 블로그 글에 이미지 마커를 삽입하는 편집자입니다.

아래 블로그 글의 **내용은 단 한 글자도 바꾸지 말고**, 적절한 위치에 \`[이미지: 구체적 설명]\` 마커만 추가해서 반환하세요.

## 삽입 규칙
- H1 제목 바로 아래에 1장
- 각 H2 소제목 바로 아래에 1장
- 텍스트 블록이 공백 제외 500자를 넘으면 중간에 1장 추가
- 마커 위아래에 빈 줄 1줄씩
- "설명"은 해당 섹션의 문맥을 반영한 구체적 시각 묘사 (인물/장면/사물을 구체적으로)

## 블로그 글
${draft}

## 출력
위 글에 이미지 마커만 추가된 마크다운 전체를 출력하세요. 다른 설명이나 메타 코멘트 금지.`;
}
