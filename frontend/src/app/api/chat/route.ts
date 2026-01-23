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

You will receive:
- User profile
- High-level analysis
- Raw transaction data

Rules for using transaction data:
- Always ground insights in provided data
- Prefer visual explanation over textual explanation
- If anomalies exist, surface them explicitly
- If trends exist, show comparisons over time
- Never guess missing data
- Transaction data should influence what UI you generate and how confident your response is.
`;

// Import data directly from the JSON files
import userProfile from "@/data/user-1/profile.json";
import transactions from "@/data/user-1/transactions.json";
import analysisSummary from "@/data/user-1/analysis.json";

export async function POST(req: NextRequest) {
    try {
        const { prompt, threadId, responseId } = await req.json();

        // Assemble the context messages
        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            {
                role: "system",
                content: "User profile (static context):\n" + JSON.stringify(userProfile)
            },
            {
                role: "system",
                content: "High-level financial analysis (derived insights):\n" + JSON.stringify(analysisSummary)
            },
            {
                role: "system",
                content: "Recent transaction history:\n" + JSON.stringify(transactions)
            },
            prompt, // The user message object { role: "user", content: "..." }
        ];

        const client = new OpenAI({
            apiKey: process.env.THESYS_API_KEY,
            baseURL: "https://api.thesys.dev/v1/embed",
        });

        const stream = await client.chat.completions.create({
            model: "c1/anthropic/claude-sonnet-4/v-20251230",
            messages: messages as any, // Type assertion for compatibility
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
