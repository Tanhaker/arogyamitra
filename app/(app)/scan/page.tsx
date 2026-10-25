import type { Metadata } from "next";
import ScanFlow from "@/components/ScanFlow";
import type { DocType } from "@/lib/types";

export const metadata: Metadata = { title: "ArogyaMitra · Scan" };

export default async function ScanPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const initial: DocType = type === "prescription" || type === "lab_report" ? type : "auto";
  return <ScanFlow initialType={initial} />;
}
