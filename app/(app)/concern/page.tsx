import type { Metadata } from "next";
import ConcernScreen from "@/components/ConcernScreen";

export const metadata: Metadata = { title: "ArogyaMitra · Describe a concern" };

export default async function ConcernPage({ searchParams }: { searchParams: Promise<{ report?: string }> }) {
  const { report } = await searchParams;
  return <ConcernScreen reportId={report} />;
}
