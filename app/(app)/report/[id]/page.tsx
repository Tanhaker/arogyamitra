import type { Metadata } from "next";
import ReportScreen from "@/components/ReportScreen";

export const metadata: Metadata = { title: "ArogyaMitra · Report" };

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportScreen id={id} />;
}
