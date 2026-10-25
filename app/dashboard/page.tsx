import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = { title: "ArogyaMitra: my health papers" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/?error=SessionRequired");
  const { id, name, email, image } = session.user;
  return <Dashboard user={{ id, name: name ?? "", email: email ?? "", image: image ?? "" }} />;
}
