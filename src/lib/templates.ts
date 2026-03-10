export interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  analysisResult: string;
  isBuiltIn?: boolean;
  createdAt?: string;
}

const STORAGE_KEY = "blog_saved_templates";

export const BUILT_IN_TEMPLATES: AnalysisTemplate[] = [
  {
    id: "honest-review",
    name: "솔직 후기형",
    description:
      "개인 경험 기반의 솔직한 후기 스타일. 구어체, 감정적, 친근한 톤으로 독자 공감을 이끌어내는 형태",
    isBuiltIn: true,
    analysisResult: `## 📝 글 구조 분석

### 1. 제목 패턴 및 스타일
- **구조**: 핵심 키워드 + 행동 유도 및 흥미 유발 문구 + 강력한 가치 제안 (예: "전 후 사진 공유해드림")
- **키워드 배치**: 제목 초반에 주요 검색 키워드를 명확히 배치하여 검색 유입에 유리
- **스타일**: 구어체로 작성하여 친근하고 솔직한 느낌. "제대로 풀어볼게", "공유해드림" 등의 표현으로 독자와 소통 강조
- **길이**: 모바일 환경에서도 한눈에 들어오면서 충분한 정보를 전달하는 적절한 길이

### 2. 서론 구성 방식
- **시작 방식**: 직접적으로 독자를 지칭하며 개인적인 이야기를 풀어놓겠다는 의도를 명확히 밝힘. 시각적 증거(전 후 사진)를 약속하며 강한 후킹 효과
- **독자 유인 기법**:
  - 개인적인 경험 공유: 과거부터 현재까지의 비극적 서사를 상세하게 풀어내 독자 공감 유도
  - 문제 제기: 과거 실패 경험과 좌절감 공유로 보편적 고통 대변
  - 희망 제시: 긍정적 메시지로 전환하며 해결책 탐색으로 이어짐
- **주제 명시**: 서론 끝에 메인 주제를 다시 강조하여 글의 방향 명확히 제시

### 3. 본론 섹션 구조
- **섹션 수**: 내용 흐름상 약 5~6개 부분
  1. 과거의 고통과 실패 경험 서사
  2. 문제 인식 및 새로운 해결책 모색
  3. 시도한 방법의 부정적 경험 (경고/비교)
  4. 핵심 해결책 상세 후기 및 정보 (가격, 효과, 주의사항)
  5. 보조 관리법 경험 (관리샵, 홈케어)
  6. 종합 결과 및 최종 추천
- **전개 방식**: 시간 순서 경험 서술 + 문제 해결 과정이 혼합

### 4. 소제목 스타일과 패턴
- 명시적인 H2/H3 태그 대신, 내용 흐름에서 자연스럽게 전환되는 소제목 역할 문장 사용
- 중요 정보는 **볼드체**와 불릿 포인트로 강조하여 가독성 확보
- 구어체 스타일 유지

### 5. 문단 길이와 구성
- **평균 문단 길이**: 매우 짧음. 한두 문장으로 이루어진 문단이 자주 등장
- **문장 수**: 각 문단 1~4문장. 정보 밀도보다 감정/메시지 전달에 집중
- **구성**: 모바일 가독성 극대화. 경험/감정/정보 단위로 자주 끊어서 집중도 유지. 불릿 포인트로 가격/주의사항 정리

### 6. 결론 방식
- **마무리 패턴**: 명시적 "결론" 섹션 없이, 최종 개선 결과와 추천 제품 정보를 제공하며 자연스럽게 마무리
- **CTA**: 명확하고 직접적인 구매/행동 유도 문구. 링크 삽입과 함께 "관리 열심히 하도록" 같은 격려 메시지

### 7. 문체 특징
- **이모지**: 텍스트 이모티콘(ㅋㅋㅋ, ↓↓) 활용, 그래픽 이모지 최소 사용
- **구어체/문어체**: 99% 구어체. 젊은 세대 표현과 비속어를 적극 사용하여 유대감 형성
- **특수 표현**:
  - 과장된 표현으로 공감 유도
  - 친근하고 격려하는 어조
  - 괄호 안의 보충 설명이나 감정 표현
  - 강조를 위한 반복

### 8. 전체적인 톤 앤 매너
- **분위기**: 초반 고통/좌절 → 중반부터 해결/희망으로 전환. 개인 고난 극복 스토리 + 정보 공유
- **전문성 수준**: 경험자의 솔직한 후기와 내돈내산 정보 중심. 과장된 리액션과 구어체로 정보 전달 부담 경감
- **타겟 독자층**: 10대 후반~30대 초반. 특정 문제로 고통받는 사람들이 주 타겟

## 🔍 SEO 상위노출 분석

### 9. 총 글자 수
- 공백 포함: 약 3,900자 / 공백 제외: 약 2,700자
- 평가: 블로그 상위노출 적합 분량 (1,000단어 이상)

### 10. 핵심 키워드 분석
- 메인 키워드를 본문에 자연스럽게 15~20회 반복
- 연관 키워드를 10~15회 배치
- 키워드 밀도 0.5~1.5% 유지

### 11. 제목 내 키워드
- 제목 맨 앞에 핵심 검색 키워드 배치
- 클릭률 높이는 유인 요소 추가 ("전후사진", "후기" 등)

### 12. 소제목 키워드
- 소제목 역할 문구에 핵심 키워드 자연스럽게 포함

### 13. 이미지/사진 삽입
- 전후 비교 사진 필수 (최소 3~5장)
- 핵심 전환점이나 중요 정보를 시각적으로 뒷받침
- 이미지 간격: 500~800자마다 1장

### 14. 내부/외부 링크
- 글 마지막에 제품 구매 링크 1~2개
- 행동 유도(CTA)와 함께 배치

### 15. 글 도입부 키워드 배치
- 첫 100자 내에 핵심 키워드 2~3번 등장
- 글의 주제를 검색 엔진에 명확히 전달

### 16. SEO 종합 점수: 88/100점
- **강점**: 키워드 최적화, 높은 CTR 유도, 풍부한 콘텐츠, 사용자 의도 충족
- **개선 포인트**: H2/H3 태그 활용, 이미지 Alt 텍스트, 내부 링크 추가, 전문성 보강 시 더 높은 점수 가능`,
  },
];

export function getSavedTemplates(): AnalysisTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalysisTemplate[];
  } catch {
    return [];
  }
}

export function saveTemplate(template: Omit<AnalysisTemplate, "id" | "isBuiltIn" | "createdAt">): AnalysisTemplate {
  const saved = getSavedTemplates();
  const newTemplate: AnalysisTemplate = {
    ...template,
    id: `custom-${Date.now()}`,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };
  saved.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return newTemplate;
}

export function deleteTemplate(id: string): void {
  const saved = getSavedTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function getAllTemplates(): AnalysisTemplate[] {
  return [...BUILT_IN_TEMPLATES, ...getSavedTemplates()];
}
