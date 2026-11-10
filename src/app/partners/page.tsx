import type { Metadata } from "next";
import { PartnerChat } from "@/components/partners/PartnerChat";

export const metadata: Metadata = { title: "Become a Partner" };

export default function PartnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Become a Partner</h1>
        <p className="mt-1 text-slate-600">
          Our assistant will ask about your business and the kind of partnership you&apos;re after, then pass everything to
          Maia, who manages DF partnerships.
        </p>
      </div>
      <PartnerChat />
    </div>
  );
}
