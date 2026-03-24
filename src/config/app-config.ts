/** 앱 모드: company(회사) / user(사용자) */
const mode = (process.env.NEXT_PUBLIC_APP_MODE || "company") as "company" | "user";

export const appConfig = {
  mode,
  isCompany: mode === "company",
  isUser: mode === "user",

  /** 앱 이름 */
  appName: mode === "company" ? "Blog Pick" : "Blog Pick",

  /** 기능 on/off (나중에 분리할 때 여기만 수정) */
  features: {
    blogGeneration: true,       // 블로그 글 생성
    threadGeneration: true,     // 쓰레드 생성
    imageAnalysis: true,        // 쓰레드 이미지 분석
    productPreset: true,        // 제품 프리셋
    templateSave: true,         // 템플릿 저장
    contentConversion: true,    // 콘텐츠 변환 (유튜브, 인스타 등)
    history: true,              // 히스토리
  },
};
