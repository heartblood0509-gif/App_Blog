/**
 * 네이버 블로그 금지어 후처리 필터.
 *
 * 창작 단계에서는 이 규칙들을 프롬프트에 넣지 않고, 생성이 끝난 뒤
 * 여기서 결정론적으로 처리한다. 이유는 두 가지:
 *   1) 금지어는 창작의 일부가 아니라 컴플라이언스다. 규칙 기반이 정답.
 *   2) 프롬프트에서 빼야 AI가 글쓰기에만 집중한다.
 */

export type Tier = 1 | 2 | 3;

export type ForbiddenEntry = {
  pattern: RegExp;
  /** 있으면 자동 치환, 없으면 경고만. */
  replace?: string;
  tier: Tier;
  reason: string;
  /** 사용자에게 제안할 대체어. */
  suggestion: string;
};

export type ReplaceInfo = {
  from: string;
  to: string;
  count: number;
};

export type Warning = {
  word: string;
  tier: Tier;
  count: number;
  reason: string;
  suggestion: string;
};

/**
 * tier1 — 자동 치환 (grammar-safe 패턴만).
 *
 * 예: "약 5만원" → "대략 5만원" (OK). "약국" → 건드리지 않음.
 * 단어 경계(앞 한글 없음, 뒤 공백+숫자/한글) 엄격 적용해서 오탐 방지.
 */
const TIER1_AUTO: ForbiddenEntry[] = [
  {
    // "총 금액", "총 3명", "총 정리" — 뒤에 공백+한글/숫자
    // 앞에 한글이 오면 합성어(총무/총각/총리/총괄)이므로 제외
    pattern: /(?<![가-힣])총(?=\s+[가-힣\d])/g,
    replace: "전체",
    tier: 1,
    reason: "네이버 스팸 필터 트리거",
    suggestion: "전체/모두/합계",
  },
  {
    // "약 30분", "약 5만원" — 뒤에 공백+숫자
    // "약국/약사/약속" 등 합성어 보호
    pattern: /(?<![가-힣])약(?=\s+\d)/g,
    replace: "대략",
    tier: 1,
    reason: "네이버 스팸 필터 트리거",
    suggestion: "대략/정도/거의",
  },
  {
    // "폭발적" 컴파운드는 안전하게 치환 가능
    pattern: /폭발적/g,
    replace: "대대적",
    tier: 1,
    reason: "네이버 스팸 필터 트리거",
    suggestion: "대대적/엄청난/큰",
  },
  {
    // "대박 할인/세일/이벤트" — 뒤에 공백+한글 명사가 올 때만 치환
    // "대박이다/대박이네" 같은 서술은 건드리지 않음
    pattern: /대박(?=\s+[가-힣])/g,
    replace: "엄청난",
    tier: 1,
    reason: "네이버 스팸 필터 트리거",
    suggestion: "엄청난/놀라운/파격",
  },
];

/**
 * tier1 flag — 경고만. 자동 치환은 문법이 깨질 위험.
 *
 * 예: "폭발" 단독 → "대인기"로 바꾸면 "인기 대인기" 같은 어색한 조합 가능.
 * 사용자가 문맥 보고 직접 고치는 게 안전.
 */
const TIER1_FLAG: ForbiddenEntry[] = [
  {
    pattern: /폭발/g,
    tier: 1,
    reason: "네이버 스팸 필터 트리거",
    suggestion: "대인기/화제/큰 인기",
  },
  {
    pattern: /대박/g,
    tier: 1,
    reason: "네이버 스팸 필터 트리거",
    suggestion: "엄청난/놀라운/파격",
  },
  {
    pattern: /중독/g,
    tier: 1,
    reason: "네이버 스팸 필터 트리거",
    suggestion: "빠져들다/반하다/매력적",
  },
  {
    pattern: /타격/g,
    tier: 1,
    reason: "네이버 스팸 필터 트리거",
    suggestion: "영향/충격/손실",
  },
  {
    pattern: /사망/g,
    tier: 1,
    reason: "네이버 스팸 필터 트리거",
    suggestion: "세상을 떠난/숨진",
  },
];

/**
 * tier2 — 의료/약사법. 자동 치환은 의미 왜곡 위험이 크므로 경고만.
 *
 * 예: "피부과 치료 경험" → "피부과 관리 경험"으로 바꾸면 의미가 달라짐.
 * 사용자 확인이 정답. LLM 재호출도 2차 오염 위험으로 비추천.
 */
const TIER2_MEDICAL: ForbiddenEntry[] = [
  {
    pattern: /치료/g,
    tier: 2,
    reason: "의료/약사법 저촉 가능",
    suggestion: "관리/케어/도움",
  },
  {
    pattern: /완치/g,
    tier: 2,
    reason: "의료/약사법 저촉 가능",
    suggestion: "개선/좋아짐",
  },
  {
    pattern: /처방/g,
    tier: 2,
    reason: "의료/약사법 저촉 가능",
    suggestion: "추천/제안",
  },
  {
    pattern: /약효/g,
    tier: 2,
    reason: "의료/약사법 저촉 가능",
    suggestion: "효과(주관적 경험 표현으로)",
  },
  {
    pattern: /부작용/g,
    tier: 2,
    reason: "의료/약사법 저촉 가능",
    suggestion: "개인차/불편감",
  },
];

/**
 * tier3 — 상업성 스팸/범죄/도박. 본문에 나오면 심각. 경고+블록.
 */
const TIER3_CRITICAL: ForbiddenEntry[] = [
  {
    pattern: /무료|공짜/g,
    tier: 3,
    reason: "상업성 스팸 트리거",
    suggestion: "무상/체험 기회",
  },
  {
    pattern: /100\s*%/g,
    tier: 3,
    reason: "상업성 스팸 트리거 (과장)",
    suggestion: "거의 전부/대부분",
  },
  {
    pattern: /최저가|파격세일|초특가|떨이|땡처리/g,
    tier: 3,
    reason: "상업성 스팸 트리거",
    suggestion: "합리적 가격/특별가",
  },
  {
    pattern: /폭탄|사살|살인|학살|테러|마약|필로폰/g,
    tier: 3,
    reason: "폭력/범죄 관련 (검색 노출 차단)",
    suggestion: "해당 표현 제거 필요",
  },
  {
    pattern: /도박|카지노|토토|슬롯|배팅|베팅/g,
    tier: 3,
    reason: "도박 관련 (검색 노출 차단)",
    suggestion: "해당 표현 제거 필요",
  },
];

/**
 * 본문에 금지어 필터를 적용한다.
 * - tier1 AUTO는 치환 (결과에 반영)
 * - 그 외는 경고로만 수집
 */
export function applyForbiddenWordFilter(input: string): {
  text: string;
  replaced: ReplaceInfo[];
  warnings: Warning[];
} {
  let text = input;
  const replaced: ReplaceInfo[] = [];
  const warnings: Warning[] = [];

  for (const entry of TIER1_AUTO) {
    const matches = text.match(entry.pattern);
    if (matches && matches.length > 0 && entry.replace !== undefined) {
      replaced.push({
        from: matches[0],
        to: entry.replace,
        count: matches.length,
      });
      text = text.replace(entry.pattern, entry.replace);
    }
  }

  const flagGroups: ForbiddenEntry[][] = [
    TIER1_FLAG,
    TIER2_MEDICAL,
    TIER3_CRITICAL,
  ];

  for (const group of flagGroups) {
    for (const entry of group) {
      const matches = text.match(entry.pattern);
      if (matches && matches.length > 0) {
        warnings.push({
          word: matches[0],
          tier: entry.tier,
          count: matches.length,
          reason: entry.reason,
          suggestion: entry.suggestion,
        });
      }
    }
  }

  return { text, replaced, warnings };
}
