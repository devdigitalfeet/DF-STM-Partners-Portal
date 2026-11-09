import type { Metadata } from "next";
import { MarketingWizard } from "@/components/marketing/MarketingWizard";

export const metadata: Metadata = { title: "Subscribe to Marketing" };

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscribe to Marketing</h1>
        <p className="mt-1 text-slate-600">Tell us what you need and we&apos;ll put together a plan for your business.</p>
      </div>
      <MarketingWizard />
    </div>
  );
}
