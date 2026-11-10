import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { runPartnerTurn, type ChatHistory } from "@/lib/partner-agent";

export const maxDuration = 60;

// The browser holds the conversation and sends it back each turn. Content blocks are passed through
// as-is (they include the model's thinking blocks, which must come back unchanged).
const bodySchema = z.object({
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.union([z.string(), z.array(z.any())]) }))
    .max(80),
  message: z.string().trim().min(1).max(4000),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    console.error("Partner assistant: set ANTHROPIC_API_KEY in .env.local");
    return Response.json({ error: "The assistant isn't configured yet. Please try again later." }, { status: 503 });
  }

  try {
    const turn = await runPartnerTurn(parsed.data.history as ChatHistory, parsed.data.message);
    return Response.json(turn);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Partner assistant: missing or invalid Anthropic credentials");
      return Response.json({ error: "The assistant isn't configured yet." }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "The assistant is busy. Please try again in a moment." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Partner assistant API error ${error.status}:`, error.message);
      return Response.json({ error: "The assistant couldn't respond. Please try again." }, { status: 502 });
    }
    console.error("Partner assistant error", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
