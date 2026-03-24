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
- **소제목 존재 여부**: 명시적 H2 소제목 없이 내용 흐름으로 자연스럽게 이어지는 경우가 많음. 필요 시 감정 전환점이나 주제 전환 지점에 소제목 사용
- **소제목 개수**: 3~5개
- **소제목 스타일**: 구어체, 감정이 담긴 표현 (예: "좌절의 연속", "환절기 탈모 샴푸 유목민 정착!", "제가 찐으로 고른 이유")
- **소제목 배치 위치**: 서사 구조의 큰 전환점에 배치 — 주로 "실패→깨달음", "깨달음→해결", "해결→결론" 사이

## 🎨 톤 & 스타일
- **문체**: 99% 구어체. "~거든요", "~했는데", "~더라고요" 등 일상 대화체. 과장된 리액션과 감정 표현으로 유대감 형성
- **제목 패턴**: 핵심 키워드 + 흥미 유발 문구 + 가치 제안 (예: "전 후 사진 공유해드림")
- **감정 표현**: 초반 고통/좌절 → 중반 희망 → 후반 만족. 괄호 안 감정 보충, 강조 반복
- **타겟 독자층**: 10대 후반~30대 초반. 특정 문제로 고통받는 사람들

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

## 🔍 SEO 기본 정보
- **총 글자 수**: 공백 포함 약 3,500~5,000자 / 공백 제외 약 2,500~3,500자
- **키워드 밀도**: 메인 키워드 10~15회 반복, 밀도 1~2%
- **이미지 패턴**: 인포그래픽/비교표 4~8장, 400~700자마다 1장`,
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
    return getSavedTemplates("threads");
  }
  return [...BUILT_IN_TEMPLATES, ...getSavedTemplates("blog")];
}
