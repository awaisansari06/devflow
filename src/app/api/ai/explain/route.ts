import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAgent, gemini } from "@inngest/agent-kit";
import { AI_MODELS } from "@/config/ai-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Create an agent using the same pattern as the rest of the app
        const explainerAgent = createAgent({
            name: "code-explainer",
            system: "You are a helpful code explanation assistant. Provide clear, concise explanations in the requested JSON format.",
            description: "An agent that explains code",
            model: gemini({
                model: AI_MODELS.EXPLAINER,
            }),
        });

        const { output } = await explainerAgent.run(prompt);

        return NextResponse.json({ explanation: output });
    } catch (error) {
        console.error("AI explanation error:", error);
        return NextResponse.json(
            { error: "Failed to generate explanation" },
            { status: 500 }
        );
    }
}
