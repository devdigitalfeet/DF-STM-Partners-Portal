import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type Lead = {
  id: string;
  type: "marketing" | "partner";
  createdAt: string;
  data: unknown;
};

const LEADS_DIR = path.join(process.cwd(), "data", "leads");

/**
 * Saves a lead as a JSON file under data/leads/ and, if LEADS_WEBHOOK_URL is set,
 * forwards it there (e.g. a Zapier or Make webhook that creates a monday.com item or sends an email).
 * Local files are a stopgap: they don't persist on serverless hosts.
 */
export async function saveLead(type: Lead["type"], data: unknown): Promise<Lead> {
  const lead: Lead = { id: randomUUID(), type, createdAt: new Date().toISOString(), data };

  await mkdir(LEADS_DIR, { recursive: true });
  await writeFile(path.join(LEADS_DIR, `${lead.createdAt.slice(0, 10)}-${type}-${lead.id}.json`), JSON.stringify(lead, null, 2));

  const webhook = process.env.LEADS_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
    } catch (err) {
      console.error("Lead webhook failed", err);
    }
  }
  return lead;
}
