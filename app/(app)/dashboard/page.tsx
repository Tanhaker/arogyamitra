import type { Metadata } from "next";
import HomeDashboard from "@/components/HomeDashboard";

export const metadata: Metadata = { title: "ArogyaMitra · Dashboard" };

export default function DashboardPage() {
  return <HomeDashboard />;
}
