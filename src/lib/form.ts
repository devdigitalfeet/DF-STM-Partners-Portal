import type { Field } from "@/config/marketing-services";

export type Value = string | string[];
export type Values = Record<string, Value>;

export function isVisible(field: Field, values: Values): boolean {
  if (!field.showIf) return true;
  const current = values[field.showIf.field];
  const selected = Array.isArray(current) ? current : current ? [current] : [];
  return field.showIf.values.some((v) => selected.includes(v));
}

function isEmpty(value: Value | undefined): boolean {
  if (value === undefined) return true;
  return Array.isArray(value) ? value.length === 0 : value.trim() === "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns a map of field id -> error message. Empty map means valid. Used on client and server. */
export function validateFields(fields: Field[], values: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!isVisible(field, values)) continue;
    const value = values[field.id];
    if (isEmpty(value)) {
      if (field.required) errors[field.id] = "This field is required.";
      continue;
    }
    if (typeof value === "string") {
      if (field.type === "email" && !EMAIL_RE.test(value)) errors[field.id] = "Enter a valid email address.";
      if (field.type === "number" && Number.isNaN(Number(value))) errors[field.id] = "Enter a number.";
    }
    if (field.options) {
      const allowed = new Set(field.options.map((o) => o.value));
      const picked = Array.isArray(value) ? value : [value];
      if (picked.some((v) => !allowed.has(v))) errors[field.id] = "Pick one of the listed options.";
    }
  }
  return errors;
}

/** Keeps only visible, known fields so stored leads never contain junk keys. */
export function pickFields(fields: Field[], values: Values): Values {
  const out: Values = {};
  for (const field of fields) {
    if (isVisible(field, values) && !isEmpty(values[field.id])) out[field.id] = values[field.id];
  }
  return out;
}
