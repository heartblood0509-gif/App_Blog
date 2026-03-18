import { resizeSchema } from "@/lib/validations";
import { getGeminiClient, formatGeminiError, withRetry } from "@/lib/gemini";
import { buildResizePrompt } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resizeSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { blogContent, targetCharCount, currentCharCount } = parsed.data;

    const client = getGeminiClient();
    const prompt = buildResizePrompt(
      blogContent,
      targetCharCount,
      currentCharCount
    );

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await withRetry(() =>
            client.models.generateContentStream({
              model: "gemini-2.5-flash",
              contents: prompt,
            })
          );

          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          controller.close();
        } catch (error) {
          controller.enqueue(
            new TextEncoder().encode(`\n\n[오류] ${formatGeminiError(error)}`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "요청 처리 중 오류";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
