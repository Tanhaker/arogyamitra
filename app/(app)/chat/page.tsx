import type { Metadata } from "next";
import ChatPanel from "@/components/ChatPanel";

export const metadata: Metadata = { title: "ArogyaMitra · Ask" };

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ report?: string }> }) {
  const { report } = await searchParams;
  return <ChatPanel initialReportIds={report ? [report] : []} />;
}
