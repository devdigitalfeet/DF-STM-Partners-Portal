import { z } from "zod";
import { BUSINESS_FIELDS, CONTACT_FIELDS, SERVICES, type ServiceId } from "@/config/marketing-services";
import { pickFields, validateFields, type Values } from "@/lib/form";
import { saveLead } from "@/lib/leads";

const valuesSchema = z.record(z.string(), z.union([z.string().max(5000), z.array(z.string().max(200)).max(20)]));

const bodySchema = z.object({
  services: z.array(z.enum(["campaigning", "seo", "social"])).min(1),
  answers: z.record(z.string(), valuesSchema),
  business: valuesSchema,
  contact: valuesSchema,
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  const { services, answers, business, contact } = parsed.data;
  const errors: Record<string, Record<string, string>> = {};
  const cleanAnswers: Partial<Record<ServiceId, Values>> = {};

  for (const id of new Set(services)) {
    const service = SERVICES.find((s) => s.id === id)!;
    const values = answers[id] ?? {};
    const e = validateFields(service.fields, values);
    if (Object.keys(e).length) errors[id] = e;
    cleanAnswers[id] = pickFields(service.fields, values);
  }
  const businessErrors = validateFields(BUSINESS_FIELDS, business);
  if (Object.keys(businessErrors).length) errors.business = businessErrors;
  const contactErrors = validateFields(CONTACT_FIELDS, contact);
  if (Object.keys(contactErrors).length) errors.contact = contactErrors;

  if (Object.keys(errors).length) return Response.json({ error: "Some fields need attention.", errors }, { status: 422 });

  const lead = await saveLead("marketing", {
    services: [...new Set(services)],
    answers: cleanAnswers,
    business: pickFields(BUSINESS_FIELDS, business),
    contact: pickFields(CONTACT_FIELDS, contact),
  });

  return Response.json({ ok: true, id: lead.id });
}
