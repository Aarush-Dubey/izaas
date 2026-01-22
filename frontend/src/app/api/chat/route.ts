import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are a personalized financial co-pilot.

Always respond using Generative UI, not plain text.

Rules:
- Trends → charts
- Breakdowns → tables
- Unusual behavior → anomaly views
- Decisions → comparisons

Never return markdown.
Never return long text explanations.
Text is allowed only as labels inside UI components.
`;

export async function POST(req: NextRequest) {
    try {
        const { prompt, threadId, responseId } = await req.json();

        const client = new OpenAI({
            apiKey: process.env.THESYS_API_KEY,
            baseURL: "https://api.thesys.dev/v1/embed",
        });

        const stream = await client.chat.completions.create({
            model: "c1/anthropic/claude-sonnet-4/v-20251230",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                prompt,
            ],
            stream: true,
        });

        const responseStream = transformStream(
            stream,
            (chunk: any) => chunk.choices[0]?.delta?.content,
        );

        return new NextResponse(responseStream as any, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.error("Error in chat endpoint:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
