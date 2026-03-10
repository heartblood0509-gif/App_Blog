import { titleSchema } from "@/lib/validations";
import { getGeminiClient } from "@/lib/gemini";
import { buildTitlePrompt } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = titleSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { analysisResult, topic, keywords } = parsed.data;

    const client = getGeminiClient();
    const prompt = buildTitlePrompt(analysisResult, topic, keywords);

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "";

    // Parse JSON array from response
    try {
      // Extract JSON array even if wrapped in markdown code blocks
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return new Response(
          JSON.stringify({ error: "제목 생성 결과를 파싱할 수 없습니다.", raw: text }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      const titles = JSON.parse(jsonMatch[0]) as string[];
      return new Response(JSON.stringify({ titles }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(
        JSON.stringify({ error: "제목 생성 결과를 파싱할 수 없습니다.", raw: text }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "요청 처리 중 오류";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
