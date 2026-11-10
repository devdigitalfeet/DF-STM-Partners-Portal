"use client";

import type { Field } from "@/config/marketing-services";
import type { Value } from "@/lib/form";

type Props = {
  field: Field;
  value: Value | undefined;
  error?: string;
  onChange: (value: Value) => void;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 aria-[invalid=true]:border-red-500";

export function FieldInput({ field, value, error, onChange }: Props) {
  const id = `f-${field.id}`;
  const describedBy = [field.help && `${id}-help`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-invalid": !!error, "aria-describedby": describedBy };
  const str = typeof value === "string" ? value : "";
  const list = Array.isArray(value) ? value : [];

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = (
        <textarea {...common} rows={3} className={inputClass} placeholder={field.placeholder} value={str} onChange={(e) => onChange(e.target.value)} />
      );
      break;
    case "select":
      control = (
        <select {...common} className={inputClass} value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "radio":
    case "multiselect": {
      const multi = field.type === "multiselect";
      control = (
        <div {...common} role={multi ? "group" : "radiogroup"} aria-labelledby={`${id}-label`} className="flex flex-wrap gap-2">
          {field.options?.map((o) => {
            const checked = multi ? list.includes(o.value) : str === o.value;
            return (
              <label
                key={o.value}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-300 ${
                  checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
                }`}
              >
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={id}
                  className="sr-only"
                  checked={checked}
                  onChange={() =>
                    onChange(multi ? (checked ? list.filter((v) => v !== o.value) : [...list, o.value]) : o.value)
                  }
                />
                {o.label}
              </label>
            );
          })}
        </div>
      );
      break;
    }
    default:
      control = (
        <input
          {...common}
          type={field.type}
          className={inputClass}
          placeholder={field.placeholder}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          min={field.type === "number" ? 0 : undefined}
        />
      );
  }

  const isGroup = field.type === "radio" || field.type === "multiselect";
  const Label = isGroup ? "p" : "label";

  return (
    <div className="space-y-2">
      <Label id={`${id}-label`} {...(!isGroup && { htmlFor: id })} className="block text-sm font-medium text-slate-800">
        {field.label}
        {field.required && <span className="text-red-600"> *</span>}
      </Label>
      {control}
      {field.help && (
        <p id={`${id}-help`} className="text-xs text-slate-500">
          {field.help}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
