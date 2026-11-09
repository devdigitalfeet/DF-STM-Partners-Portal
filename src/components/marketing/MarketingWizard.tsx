"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BUSINESS_FIELDS,
  CONTACT_FIELDS,
  SERVICES,
  type Field,
  type ServiceId,
} from "@/config/marketing-services";
import { isVisible, validateFields, type Value, type Values } from "@/lib/form";
import { FieldInput } from "./FieldInput";

type Step =
  | { kind: "services" }
  | { kind: "service"; id: ServiceId }
  | { kind: "business" }
  | { kind: "contact" }
  | { kind: "review" };

export function MarketingWizard() {
  const [selected, setSelected] = useState<ServiceId[]>([]);
  const [answers, setAnswers] = useState<Record<string, Values>>({});
  const [business, setBusiness] = useState<Values>({});
  const [contact, setContact] = useState<Values>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  // Keep service steps in config order regardless of click order.
  const steps = useMemo<Step[]>(
    () => [
      { kind: "services" },
      ...SERVICES.filter((s) => selected.includes(s.id)).map((s) => ({ kind: "service" as const, id: s.id })),
      { kind: "business" },
      { kind: "contact" },
      { kind: "review" },
    ],
    [selected],
  );
  const step = steps[stepIndex];

  const current = (): { fields: Field[]; values: Values; set: (v: Values) => void } | null => {
    switch (step.kind) {
      case "service": {
        const service = SERVICES.find((s) => s.id === step.id)!;
        return {
          fields: service.fields,
          values: answers[step.id] ?? {},
          set: (v) => setAnswers((a) => ({ ...a, [step.id]: v })),
        };
      }
      case "business":
        return { fields: BUSINESS_FIELDS, values: business, set: setBusiness };
      case "contact":
        return { fields: CONTACT_FIELDS, values: contact, set: setContact };
      default:
        return null;
    }
  };
  const form = current();

  function next() {
    if (step.kind === "services" && selected.length === 0) {
      setErrors({ services: "Pick at least one service." });
      return;
    }
    if (form) {
      const e = validateFields(form.fields, form.values);
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    setErrors({});
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setErrors({});
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: selected, answers, business, contact }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h2 className="text-2xl font-semibold text-emerald-900">Thanks, we&apos;ve got your request</h2>
        <p className="mt-2 text-emerald-800">
          Our team will review your answers and get back to you within one business day with a tailored proposal.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-emerald-900 underline">
          Back to start
        </Link>
      </div>
    );
  }

  const title =
    step.kind === "services"
      ? "Which services are you interested in?"
      : step.kind === "service"
        ? `${SERVICES.find((s) => s.id === step.id)!.name} details`
        : step.kind === "business"
          ? "About your business"
          : step.kind === "contact"
            ? "How can we reach you?"
            : "Review your request";

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
          <span>
            Step {stepIndex + 1} of {steps.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">{title}</h2>

        {step.kind === "services" && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {SERVICES.map((s) => {
                const on = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected((cur) => (on ? cur.filter((x) => x !== s.id) : [...cur, s.id]))}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      on ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <span className="flex items-center justify-between font-semibold text-slate-900">
                      {s.name}
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                          on ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                        }`}
                      >
                        {on && "✓"}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">{s.summary}</span>
                  </button>
                );
              })}
            </div>
            {errors.services && <p className="text-sm text-red-600">{errors.services}</p>}
          </div>
        )}

        {form && (
          <div className="space-y-5">
            {form.fields
              .filter((f) => isVisible(f, form.values))
              .map((f) => (
                <FieldInput
                  key={f.id}
                  field={f}
                  value={form.values[f.id]}
                  error={errors[f.id]}
                  onChange={(v: Value) => form.set({ ...form.values, [f.id]: v })}
                />
              ))}
          </div>
        )}

        {step.kind === "review" && (
          <Review selected={selected} answers={answers} business={business} contact={contact} onEdit={setStepIndex} steps={steps} />
        )}

        {status === "error" && (
          <p className="mt-4 text-sm text-red-600">Something went wrong sending your request. Please try again.</p>
        )}
      </div>

      <div className="flex justify-between">
        {stepIndex > 0 ? (
          <button type="button" onClick={back} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            ← Back
          </button>
        ) : (
          <Link href="/" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            ← Home
          </Link>
        )}
        {step.kind === "review" ? (
          <button
            type="button"
            onClick={submit}
            disabled={status === "sending"}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Submit request"}
          </button>
        ) : (
          <button type="button" onClick={next} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}

function display(field: Field, value: Value | undefined): string {
  if (value === undefined || (Array.isArray(value) && value.length === 0) || value === "") return "—";
  const label = (v: string) => field.options?.find((o) => o.value === v)?.label ?? v;
  return Array.isArray(value) ? value.map(label).join(", ") : label(value);
}

function Section({ title, fields, values, onEdit }: { title: string; fields: Field[]; values: Values; onEdit: () => void }) {
  return (
    <div className="border-b border-slate-100 pb-4 last:border-0">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <button type="button" onClick={onEdit} className="text-sm font-medium text-indigo-600 hover:underline">
          Edit
        </button>
      </div>
      <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {fields
          .filter((f) => isVisible(f, values))
          .map((f) => (
            <div key={f.id} className="contents">
              <dt className="text-slate-500">{f.label}</dt>
              <dd className="text-slate-900">{display(f, values[f.id])}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

function Review(props: {
  selected: ServiceId[];
  answers: Record<string, Values>;
  business: Values;
  contact: Values;
  steps: Step[];
  onEdit: (i: number) => void;
}) {
  const { answers, business, contact, steps, onEdit } = props;
  const indexOf = (pred: (s: Step) => boolean) => steps.findIndex(pred);
  return (
    <div className="space-y-4">
      {steps
        .filter((s): s is { kind: "service"; id: ServiceId } => s.kind === "service")
        .map((s) => {
          const service = SERVICES.find((x) => x.id === s.id)!;
          return (
            <Section
              key={s.id}
              title={service.name}
              fields={service.fields}
              values={answers[s.id] ?? {}}
              onEdit={() => onEdit(indexOf((x) => x.kind === "service" && x.id === s.id))}
            />
          );
        })}
      <Section title="Business" fields={BUSINESS_FIELDS} values={business} onEdit={() => onEdit(indexOf((x) => x.kind === "business"))} />
      <Section title="Contact" fields={CONTACT_FIELDS} values={contact} onEdit={() => onEdit(indexOf((x) => x.kind === "contact"))} />
    </div>
  );
}
