export interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  analysisResult: string;
  isBuiltIn?: boolean;
  createdAt?: string;
  sourceMode?: "crawl" | "image"; // 쓰레드 템플릿의 원본 분석 모드
}

const STORAGE_KEY = "blog_saved_templates";
const THREADS_STORAGE_KEY = "threads_saved_templates";

export const BUILT_IN_TEMPLATES: AnalysisTemplate[] = [
  {
    id: "review-style",
    name: "후기성 글쓰기",
    description:
      "개인 경험 기반의 솔직한 후기 스타일. 공감→실패→깨달음→해결의 감정 흐름으로 독자를 끌어들이는 글",
    isBuiltIn: true,
    analysisResult: `## 📖 서사 구조 분석

1. 무심했던 초기 상태 (도입) — 문제를 인식하지 못하던 평범한 일상
2. 이상함 감지 — 반복되는 증상/문제 발견 (문제 인식)
3. 스트레스 구간 — 불안, 걱정, 자존감 하락 (공감 포인트)
4. 정보 탐색 — 검색, 주변 조언, 커뮤니티 탐색 (행동 전환)
5. 첫 해결 시도 — 쉽게 접근 가능한 방법 시도 (시도)
6. 한계 경험 — 재발, 부작용, 기대 이하의 결과 (실패)
7. 원인 재해석 — 근본 원인을 새롭게 이해 (핵심 깨달음)
8. 기준 변화 — 제품/방법 선택 기준이 바뀜 (전환점)
9. 새로운 제품/방법 도입 (해결)
10. 이유 연결 — 성분, 원리, 작용 방식 설명 (논리 보강)
11. 추가 관리 — 보조 루틴, 생활 습관 개선 (실용 팁)
12. 병원/전문가 언급 (신뢰 보강)
13. 결론 — 핵심 메시지 + 격려 (마무리)

## 📋 서사 유형
**감정 선공형** — 스트레스/공감 상황으로 시작하여 실패→깨달음→해결로 이어지는 구조. 독자가 "나도 그랬어"라고 느끼며 자연스럽게 해결책까지 읽게 만드는 흐름.

## 📌 소제목 분석
- **소제목 존재 여부**: H2 소제목을 활용하여 서사 전환점을 명확히 구분
- **소제목 개수**: 3~5개
- **소제목 스타일**: 구어체, 감정이 담긴 표현 (예: "좌절의 연속", "환절기 탈모 샴푸 유목민 정착!", "제가 찐으로 고른 이유")
- **소제목 배치 위치**: 서사 구조의 큰 전환점에 배치 — 주로 "실패→깨달음", "깨달음→해결", "해결→결론" 사이

## 🎨 톤 & 스타일
- **문체**: 99% 구어체. "~거든요", "~했는데", "~더라고요" 등 일상 대화체. 과장된 리액션과 감정 표현으로 유대감 형성
- **제목 패턴**: 핵심 키워드 + 흥미 유발 문구 + 가치 제안 (예: "전 후 사진 공유해드림")
- **감정 표현**: 초반 고통/좌절 → 중반 희망 → 후반 만족. 괄호 안 감정 보충, 강조 반복
- **타겟 독자층**: 10대 후반~30대 초반. 특정 문제로 고통받는 사람들

## 🛒 제품 배치 분석
- **제품 등장 여부**: 있음 (후기성 글 특성상 해결 단계에서 제품 등장)
- **제품 등장 시점**: 서사 구조 9단계 '새로운 제품/방법 도입(해결)'에서 첫 등장
- **도입 흐름**: 실패 경험 → 원인 재해석(깨달음) → 기준 변화 → 해결 원리에 맞는 성분/요소 언급 → 제품 연결
- **제품명 언급 횟수**: 1~2회
- **제품 관련 분량**: 1~2문단 / 전체 10~13문단 (약 10~15%)
- **제품 언급 톤**: 경험담 속 자연스러운 언급. 사용 결과를 중심으로 간접 전달

## 🔍 SEO 기본 정보
- **총 글자 수**: 공백 포함 약 3,900자 / 공백 제외 약 2,700자
- **키워드 밀도**: 메인 키워드 15~20회 반복, 밀도 0.5~1.5%
- **이미지 패턴**: 전후 비교 사진 3~5장, 500~800자마다 1장`,
  },
  {
    id: "informational-style",
    name: "정보성 글쓰기",
    description:
      "객관적 정보 전달 중심의 전문적 스타일. 개념→분류→비교→활용 순서로 체계적으로 정보를 전달하는 글",
    isBuiltIn: true,
    analysisResult: `## 📖 서사 구조 분석

1. 주제 도입 — 왜 이 정보가 필요한지 배경 설명 (도입)
2. 기본 개념 — 주제의 정의와 핵심 원리 (정의)
3. 종류/유형 분류 — 카테고리별 정리 (분류)
4. 각 유형의 특징 — 장단점, 차이점 비교 (비교 분석)
5. 선택 기준 제시 — 상황별 추천 기준 (가이드)
6. 실제 활용법 — 구체적인 사용 방법과 팁 (실용 정보)
7. 주의사항 — 흔한 실수, 피해야 할 것 (경고)
8. FAQ/흔한 오해 — 자주 묻는 질문 정리 (보완)
9. 결론 — 핵심 요약 + 추천 (마무리)

## 📋 서사 유형
**정보 가이드형** — 주제의 개념→분류→비교→활용→주의사항 순서로 논리적으로 정보를 전달하는 구조. 독자가 처음부터 끝까지 읽으면 해당 주제를 완전히 이해할 수 있도록 설계.

## 📌 소제목 분석
- **소제목 존재 여부**: H2/H3 소제목을 적극 활용하여 명확한 정보 계층 구조 구성
- **소제목 개수**: 4~6개
- **소제목 스타일**: 문어체, 키워드 포함, 정보 범위를 명확히 전달 (예: "OO 종류와 특징", "OO 선택 시 주의사항", "OO 활용 팁 3가지")
- **소제목 배치 위치**: 서사 구조의 각 단계마다 배치 — "정의", "분류", "비교", "활용", "주의사항" 등 논리적 전환점에 소제목 존재

## 🎨 톤 & 스타일
- **문체**: 80% 문어체 + 20% 부드러운 구어체. "~입니다", "~됩니다" 기반이지만 "~해보세요", "~거든요" 등으로 딱딱함 완화
- **제목 패턴**: 핵심 키워드 + 정보 범위 ("총정리", "A to Z", "완벽 가이드")
- **감정 표현**: 절제된 톤. 감정보다 팩트와 데이터 중심. "참고로", "덧붙이자면" 등으로 부가 정보 삽입
- **타겟 독자층**: 특정 주제 정보를 찾는 모든 연령대. 초보자도 이해 가능한 난이도

## 🛒 제품 배치 분석
- **제품 등장 여부**: 없음 (순수 정보성/가이드 글)

## 🔍 SEO 기본 정보
- **총 글자 수**: 공백 포함 약 3,500~5,000자 / 공백 제외 약 2,500~3,500자
- **키워드 밀도**: 메인 키워드 10~15회 반복, 밀도 1~2%
- **이미지 패턴**: 인포그래픽/비교표 4~8장, 400~700자마다 1장`,
  },
];

export const BUILT_IN_THREADS_TEMPLATES: AnalysisTemplate[] = [
  {
    id: "threads-tip-style",
    name: "팁 제공형 쓰레드",
    description:
      "문제 제기 → 팁 제공 구조. 숫자 충격으로 시선을 잡고, 본문에서 궁금증을 유발한 뒤 고정 댓글로 해결책을 제시하는 스타일",
    isBuiltIn: true,
    sourceMode: "image",
    analysisResult: `## 📝 텍스트 추출

본문 텍스트와 댓글 텍스트로 구성된 2단 구조입니다.

- **본문**: 핵심 정보 + 문제 제기 + 궁금증 유발
- **고정 댓글**: 구체적 해결책 + CTA(Call-to-Action)

## 📖 게시물 구조 분석

### 본문의 서사 흐름

총 6줄로 구성되어 있으며, 각 줄은 명확한 역할을 수행합니다.
1줄: 핵심 정보 및 가치 제안 (구체적 숫자로 절약/효과 제시, 단점도 명시)
2줄: 핵심 정보의 근거 제시 (문제의 원인 지적)
3~4줄: 독자의 의심 해소 및 핵심 메시지 반복 강조
5줄: 궁금증 유발 및 참여 유도 (해결책을 바로 공개하지 않고 호기심 자극)
6줄: 핵심 키워드 제시 (검색 용이성 및 콘텐츠 정체성)

### 댓글의 역할

작성자의 고정 댓글은 본문에서 던진 질문에 대한 구체적인 해결책을 제공하는 역할을 합니다.
플랫폼의 성격, 비용 및 혜택, 장기적 이점과 안정성까지 상세 정보를 전달합니다.
마지막에는 프로필 링크로 연결하여 실질적인 행동(회원가입)을 유도합니다.

### 본문과 댓글 사이의 정보 분리 방식

- **본문(Hook & Problem)**: 독자의 주의를 끌고, 문제를 인식시킨 뒤, 해결책에 대한 궁금증을 극대화
- **댓글(Solution & CTA)**: 본문에서 유발된 궁금증을 해소해주는 상세한 정보와 구체적인 행동 지침 제공

이러한 분리 방식은 독자의 체류 시간을 늘리고 댓글 확인을 유도하여 게시물 참여도를 높이는 전형적인 소셜 미디어 전략입니다.

## 📋 서사 유형

**문제 제기 → 팁 제공형** — 기존 방식의 문제를 제기하고, 구체적인 팁과 방법을 제공하는 구조.

**훅(Hook) 전략: 숫자 충격 (Number Shock)** — 구체적이고 강력한 숫자를 첫 문장에 제시하여 타겟 고객의 시선을 즉각적으로 사로잡습니다.

## 🎨 톤 & 스타일

- **말투**: 반말, 매우 높은 수준의 구어체. "~해", "~거지", "~같아", "~줄게" 등 친구에게 알려주는 듯한 친근하고 자신감 있는 어조
- **문장 구조**: 한 문장의 길이가 짧고 간결. 핵심 메시지 단위로 줄바꿈하여 모바일 가독성 극대화
- **이모지/특수문자**: 사용 빈도 낮음. 느낌표(!)로 강조, 댓글에서는 리스트 마커 활용
- **해시태그**: 공식 해시태그 미사용. 본문 마지막에 키워드 역할의 단어 배치

## 📸 이미지 분석

- **이미지 유형**: 실제 사진 2장
- **이미지 스타일**: 자연광 감성 여행 사진. 필터 과하지 않고 생생한 느낌
- **이미지 역할**: 텍스트의 주장을 시각적으로 증명하고 로망을 자극. 논리적 정보 + 감성적 가치

## 🔍 참여 유도 요소

- **1차 CTA (Implicit)**: 본문 마지막 — "궁금하면 알려줄게" (댓글 확인 유도)
- **2차 CTA (Explicit)**: 고정 댓글 마지막 — "프로필 링크에서 가입하여 둘러보기 가능" (행동 유도)
- **댓글/공유 유도**: 정보의 공백(Information Gap)으로 사용자가 댓글 확인하게 유도
- **링크 활용**: 프로필 링크(Link in Bio) 방식으로 알고리즘 페널티 회피`,
  },
];

export function getSavedTemplates(contentType: "blog" | "threads" = "blog"): AnalysisTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const key = contentType === "threads" ? THREADS_STORAGE_KEY : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as AnalysisTemplate[];
  } catch {
    return [];
  }
}

export function saveTemplate(template: Omit<AnalysisTemplate, "id" | "isBuiltIn" | "createdAt">, contentType: "blog" | "threads" = "blog"): AnalysisTemplate {
  const saved = getSavedTemplates(contentType);
  const newTemplate: AnalysisTemplate = {
    ...template,
    id: `custom-${Date.now()}`,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };
  saved.push(newTemplate);
  const key = contentType === "threads" ? THREADS_STORAGE_KEY : STORAGE_KEY;
  localStorage.setItem(key, JSON.stringify(saved));
  return newTemplate;
}

export function deleteTemplate(id: string, contentType: "blog" | "threads" = "blog"): void {
  const key = contentType === "threads" ? THREADS_STORAGE_KEY : STORAGE_KEY;
  const saved = getSavedTemplates(contentType).filter((t) => t.id !== id);
  localStorage.setItem(key, JSON.stringify(saved));
}

export function getAllTemplates(contentType: "blog" | "threads" = "blog"): AnalysisTemplate[] {
  if (contentType === "threads") {
    return [...BUILT_IN_THREADS_TEMPLATES, ...getSavedTemplates("threads")];
  }
  return [...BUILT_IN_TEMPLATES, ...getSavedTemplates("blog")];
}
