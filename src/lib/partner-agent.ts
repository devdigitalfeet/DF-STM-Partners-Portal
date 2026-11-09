import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { saveLead } from "@/lib/leads";

export type ChatHistory = Anthropic.Beta.BetaMessageParam[];

const client = new Anthropic();
const MODEL = "claude-opus-5-5";
const MAX_TOOL_ROUNDS = 3;

const bookingUrl = process.env.MAIA_BOOKING_URL;

// Edit this prompt to change how the assistant talks, what it asks and what it knows about the partner programme.
const SYSTEM_PROMPT = `You are the partnerships assistant on the DF (Digitalfeet) partner portal. Prospective partners talk to you before they are introduced to Maia, who manages DF partnerships.

Your job:
1. Welcome the prospect and learn about them through a natural conversation, one or two questions at a time. You need:
   - their name, company, email (phone and website are optional)
   - what their company does and who their clients are
   - which kind of partnership they're after: referral partner (sends clients to DF for a commission), white-label partner (resells DF services under their own brand), agency / reseller partner (bundles DF services with their own), technology / integration partner, or something else
   - roughly how many clients or how much work they could bring, and which DF services interest them (campaigning, SEO, social media, web)
   - what they hope to get from the partnership
2. Answer general questions about how partnering with DF works. Stay at a general level: you must never promise commission rates, pricing, contract terms or approval. Say Maia will cover those on a call.
3. Once you have the required details, briefly confirm them with the prospect, then call the submit_partner_application tool. Call it once per conversation, and only after the prospect has confirmed.
4. After submitting, thank them and say Maia will be in touch within one business day.${bookingUrl ? ` They can also book a call with Maia directly at ${bookingUrl}.` : ""}

Rate fit honestly in the tool call: "strong" when their clients and goals clearly match DF services, "possible" when it's unclear, "weak" when they don't fit (still submit; Maia decides).
Keep replies short, warm and professional, in plain text without markdown headings. If someone is a prospective marketing client rather than a partner, point them to the "Subscribe to Marketing" option on the portal home page.`;

const nullableString = { type: ["string", "null"] } as const;

const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "submit_partner_application",
    description:
      "Send the prospect's partnership application to Maia. Call only after collecting the required details and the prospect has confirmed them.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: [
        "contact_name",
        "email",
        "phone",
        "company_name",
        "website",
        "company_description",
        "partnership_type",
        "client_base",
        "services_of_interest",
        "goals",
        "fit",
        "summary_for_maia",
      ],
      properties: {
        contact_name: { type: "string" },
        email: { type: "string" },
        phone: nullableString,
        company_name: { type: "string" },
        website: nullableString,
        company_description: { type: "string", description: "What the company does and who its clients are." },
        partnership_type: { type: "string", enum: ["referral", "white_label", "agency_reseller", "technology", "other"] },
        client_base: { type: "string", description: "Size of client base or expected volume of referred work." },
        services_of_interest: {
          type: "array",
          items: { type: "string", enum: ["campaigning", "seo", "social_media", "web", "other"] },
        },
        goals: { type: "string" },
        fit: { type: "string", enum: ["strong", "possible", "weak"] },
        summary_for_maia: {
          type: "string",
          description: "Three to five sentences for Maia: who they are, what they want, why the fit rating, open questions for the call.",
        },
      },
    },
  },
];

const applicationSchema = z.object({
  contact_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable(),
  company_name: z.string().min(1),
  website: z.string().nullable(),
  company_description: z.string(),
  partnership_type: z.enum(["referral", "white_label", "agency_reseller", "technology", "other"]),
  client_base: z.string(),
  services_of_interest: z.array(z.enum(["campaigning", "seo", "social_media", "web", "other"])),
  goals: z.string(),
  fit: z.enum(["strong", "possible", "weak"]),
  summary_for_maia: z.string(),
});

function transcript(history: ChatHistory): { role: string; text: string }[] {
  return history.flatMap((m) => {
    const blocks = typeof m.content === "string" ? [{ type: "text" as const, text: m.content }] : m.content;
    const text = (blocks ?? [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return text ? [{ role: m.role, text }] : [];
  });
}

export type AgentTurn = { history: ChatHistory; reply: string; submitted: boolean };

/**
 * Runs one prospect turn: appends their message, lets the model reply (and possibly submit the application),
 * and returns the updated history. The history keeps the model's full content blocks, thinking included,
 * because they must be sent back unchanged on the next request.
 */
export async function runPartnerTurn(previous: ChatHistory, userText: string): Promise<AgentTurn> {
  const history: ChatHistory = [...previous, { role: "user", content: userText }];
  let submitted = previous.some(
    (m) => Array.isArray(m.content) && m.content.some((b) => b.type === "tool_use" && b.name === "submit_partner_application"),
  );

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const message = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      cache_control: { type: "ephemeral" },
      messages: history,
    });

    if (message.stop_reason === "refusal") {
      return {
        history: previous,
        reply: "Sorry, I can't help with that here. You're welcome to contact our team directly instead.",
        submitted,
      };
    }

    history.push({ role: "assistant", content: message.content });

    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0 || message.stop_reason !== "tool_use") {
      const reply = message.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim();
      return { history, reply, submitted };
    }

    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const tool of toolUses) {
      const parsed = tool.name === "submit_partner_application" ? applicationSchema.safeParse(tool.input) : null;
      if (!parsed?.success) {
        results.push({
          type: "tool_result",
          tool_use_id: tool.id,
          is_error: true,
          content: parsed ? `Invalid application: ${parsed.error.message}` : `Unknown tool ${tool.name}`,
        });
        continue;
      }
      if (submitted) {
        results.push({ type: "tool_result", tool_use_id: tool.id, content: "Already submitted in this conversation." });
        continue;
      }
      const lead = await saveLead("partner", { application: parsed.data, transcript: transcript(history) });
      submitted = true;
      results.push({ type: "tool_result", tool_use_id: tool.id, content: `Submitted. Reference: ${lead.id.slice(0, 8)}` });
    }
    history.push({ role: "user", content: results });
  }

  return { history, reply: "Thanks, I've passed your details on. Maia will be in touch soon.", submitted };
}
