import { getGeminiClient, formatGeminiError, withRetry } from "@/lib/gemini";
import { buildThreadsFromNewsPrompt } from "@/lib/prompts";
import { crawlUrl } from "@/lib/crawlers";
import { z } from "zod";

export const maxDuration = 120;

const generateThreadsSchema = z.object({
  url: z.string().url("유효한 URL을 입력해주세요."),
  requirements: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateThreadsSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Crawl the news article
    let newsContent: string;
    try {
      const crawlResult = await crawlUrl(parsed.data.url);
      newsContent = crawlResult.title
        ? `# ${crawlResult.title}\n\n${crawlResult.content}`
        : crawlResult.content;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "크롤링 실패";
      return new Response(
        JSON.stringify({
          error: `뉴스 기사 크롤링에 실패했습니다: ${msg}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = getGeminiClient();
    const prompt = buildThreadsFromNewsPrompt(
      newsContent,
      parsed.data.requirements
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
