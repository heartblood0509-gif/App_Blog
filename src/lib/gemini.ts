import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/** Gemini API 에러를 사용자 친화적 메시지로 변환 */
export function formatGeminiError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
    return "API 요청 한도를 초과했습니다. 잠시 후(약 30초) 다시 시도해주세요.";
  }
  if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
    return "API 키가 유효하지 않습니다. 환경 설정을 확인해주세요.";
  }
  if (msg.includes("500") || msg.includes("INTERNAL")) {
    return "AI 서버에 일시적 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
  return msg;
}

/** 429 에러 시 한 번 자동 재시도 (25초 대기) */
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const isRateLimit = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
    if (isRateLimit) {
      await new Promise((r) => setTimeout(r, 25000));
      return await fn();
    }
    throw error;
  }
}
