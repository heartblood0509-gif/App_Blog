export function buildAnalysisPrompt(referenceText: string): string {
  return `다음 블로그 글을 분석하여 구조와 특징을 추출해주세요.

---
${referenceText}
---

다음 항목들을 상세하게 분석해주세요:

## 📝 글 구조 분석
1. **제목 패턴 및 스타일**: 제목의 구조, 키워드 배치, 길이 등
2. **서론 구성 방식**: 첫 문단의 시작 방식, 독자 유인 기법 등
3. **본론 섹션 구조**: 섹션 수, 각 섹션의 구성, 전개 방식
4. **소제목 스타일과 패턴**: 소제목 형식, 번호 사용 여부 등
5. **문단 길이와 구성**: 평균 문단 길이, 문장 수 등
6. **결론 방식**: 마무리 패턴, CTA(행동 유도) 여부 등
7. **문체 특징**: 이모지 사용, 구어체/문어체, 특수 표현 등
8. **전체적인 톤 앤 매너**: 글의 분위기, 전문성 수준, 타겟 독자층 등

## 🔍 SEO 상위노출 분석
9. **총 글자 수**: 공백 포함/제외 글자 수를 정확히 세서 알려주세요. 블로그 상위노출에 적합한 분량인지도 평가해주세요.
10. **핵심 키워드 분석**: 본문에서 반복적으로 등장하는 키워드 목록과 각 등장 횟수, 키워드 밀도(%)를 표로 정리해주세요.
11. **제목 내 키워드**: 제목에 포함된 핵심 키워드와 SEO 관점에서의 적합성
12. **소제목(H2/H3) 키워드 포함 여부**: 소제목에 키워드가 자연스럽게 포함되어 있는지
13. **이미지/사진 삽입 분석**: 이미지가 삽입된 것으로 추정되는 위치와 예상 개수, 이미지 간격 패턴. 상위노출에 적합한 이미지 수인지 평가
14. **내부/외부 링크 사용**: 링크 사용 여부와 패턴
15. **글 도입부 키워드 배치**: 첫 100자 내에 핵심 키워드가 포함되어 있는지
16. **SEO 종합 점수 및 평가**: 이 글의 검색 상위노출 가능성을 100점 만점으로 평가하고, 개선 포인트를 구체적으로 요약

결과를 마크다운 형식으로 정리해주세요.`;
}

export function buildTitlePrompt(
  analysisResult: string,
  topic: string,
  keywords: string
): string {
  return `당신은 블로그 SEO 제목 전문가입니다.

## 분석 결과
${analysisResult}

## 요청
- **주제**: ${topic}
- **키워드**: ${keywords}

위 분석 결과의 제목 패턴과 스타일을 참고하여, 주제와 키워드에 맞는 블로그 제목을 3개 추천해주세요.

### 제목 작성 기준:
- 핵심 키워드를 제목 앞부분에 배치 (SEO 최적화)
- 클릭을 유도하는 흥미로운 표현 포함
- 분석된 제목 스타일(구어체/문어체, 길이 등)을 따를 것
- 각 제목은 서로 다른 느낌으로 작성

**반드시 아래 JSON 형식으로만 응답해주세요. 다른 설명은 포함하지 마세요:**
["제목1", "제목2", "제목3"]`;
}

export function buildGenerationPrompt(
  analysisResult: string,
  topic: string,
  keywords: string,
  options?: {
    selectedTitle?: string;
    productName?: string;
    productAdvantages?: string;
    requirements?: string;
    charCountRange?: string;
  }
): string {
  const productSection = options?.productName
    ? `- **제품명**: ${options.productName}${options?.productAdvantages ? `\n- **제품 장점**: ${options.productAdvantages}` : ""}`
    : "";

  let charCountInstruction: string;
  switch (options?.charCountRange) {
    case "1500-2500":
      charCountInstruction =
        "- **글자 수(공백 제외) 1,500~2,500자** 범위로 작성해주세요";
      break;
    case "2500-3500":
      charCountInstruction =
        "- **글자 수(공백 제외) 2,500~3,500자** 범위로 작성해주세요";
      break;
    default:
      charCountInstruction =
        "- **레퍼런스와 비슷한 글자 수(공백 제외)로 작성할 것** - 분석 결과의 총 글자 수를 참고하여 유사한 분량을 맞춰주세요";
      break;
  }

  return `당신은 브랜드 블로그 콘텐츠 작성 전문가입니다.

## 레퍼런스 분석 결과
${analysisResult}

## 작성 요청
- **주제**: ${topic}
- **키워드**: ${keywords}
${productSection}
${options?.requirements ? `- **추가 요구사항**: ${options.requirements}` : ""}

## 작성 지침
위 분석 결과의 **구조와 스타일만** 참고하여 완전히 새로운 블로그 글을 작성해주세요.

⚠️ **절대 금지 사항:**
- 레퍼런스 글의 문장을 그대로 복사하거나 살짝 바꿔 쓰는 것
- 레퍼런스의 구체적 사례나 예시를 그대로 가져오는 것

✅ **반드시 지킬 사항:**
- **반드시 마크다운 H1(#) 제목으로 글을 시작할 것**${options?.selectedTitle ? ` - 제목: "${options.selectedTitle}"` : ""}
- 구조와 형식만 참고하고, 내용은 100% 새로 작성
- 지정된 키워드를 자연스럽게 포함
- 분석된 톤 앤 매너를 유지
- 마크다운 형식으로 작성
- 분석된 문단 길이와 섹션 구조를 따를 것
${charCountInstruction}
- SEO 최적화: 키워드를 제목, 소제목, 도입부 100자 이내에 자연스럽게 배치
- SEO 최적화: 키워드 밀도 1~3%를 유지하도록 본문 전체에 고르게 분산
- 이미지 삽입 위치를 [이미지: 설명] 형태로 표시해주세요 (레퍼런스의 이미지 패턴 참고)${options?.productName ? `\n- **제품 자연스럽게 녹이기**: "${options.productName}" 제품을 글 흐름에 자연스럽게 포함하되, 노골적인 광고처럼 보이지 않도록 경험담이나 추천 형태로 작성${options?.productAdvantages ? `. 제품의 장점(${options.productAdvantages})을 자연스럽게 언급` : ""}` : ""}`;
}

export type ConvertFormat =
  | "youtube-longform"
  | "youtube-shortform"
  | "instagram"
  | "threads";

export function buildConvertPrompt(
  blogContent: string,
  format: ConvertFormat
): string {
  const formatInstructions: Record<ConvertFormat, string> = {
    "youtube-longform": `## 변환 요청: 유튜브 롱폼 대본

다음 블로그 글을 유튜브 롱폼 영상 대본으로 변환해주세요.

### 변환 지침:
- 자연스러운 말하기 톤으로 변환 (구어체)
- 인트로 후킹 멘트로 시작
- 섹션별로 "컷" 또는 장면 전환 표시
- 시청자에게 말을 거는 듯한 어조
- 구독/좋아요 CTA 자연스럽게 삽입
- 영상 길이 약 8~15분 분량
- [B-roll: 설명] 형태로 보조 영상 삽입 위치 표시
- 마크다운 형식으로 작성`,

    "youtube-shortform": `## 변환 요청: 유튜브 숏폼 대본

다음 블로그 글에서 핵심 내용을 추출하여 60초 이내의 숏폼 영상 대본으로 변환해주세요.

### 변환 지침:
- 첫 3초 안에 강력한 후킹 멘트 (궁금증 유발)
- 핵심 정보만 압축하여 전달
- 빠른 템포의 구어체
- 총 60초 이내 분량 (약 200~300자)
- [화면: 설명] 형태로 화면 구성 표시
- 마지막에 팔로우/구독 유도
- 마크다운 형식으로 작성`,

    instagram: `## 변환 요청: 인스타그램 피드 글

다음 블로그 글을 인스타그램 피드 게시물 텍스트로 변환해주세요.

### 변환 지침:
- 첫 줄에 강력한 후킹 문구 (피드에서 "더 보기" 클릭 유도)
- 줄바꿈을 활용한 가독성 확보
- 이모지 적절히 활용
- 핵심 내용을 간결하게 요약 (2,200자 이내)
- 마지막에 행동 유도 (저장/공유/댓글 유도)
- 관련 해시태그 15~20개 추가
- 마크다운 형식 없이 일반 텍스트로 작성`,

    threads: `## 변환 요청: 쓰레드 피드 글

다음 블로그 글을 쓰레드(Threads) 게시물로 변환해주세요.

### 변환 지침:
- 짧고 임팩트 있는 문장으로 구성
- 500자 이내로 핵심만 압축
- 대화하는 듯한 캐주얼한 톤
- 의견이나 관점을 명확히 표현
- 댓글/공유를 유도하는 질문으로 마무리
- 해시태그 3~5개
- 마크다운 형식 없이 일반 텍스트로 작성`,
  };

  return `당신은 콘텐츠 변환 전문가입니다.

## 원본 블로그 글
${blogContent}

${formatInstructions[format]}`;
}
