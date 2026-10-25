import { notFound } from "next/navigation";
import Dashboard from "@/components/Dashboard";

/** Local-only layout preview of the signed-in app (404 in production). APIs still require sign-in. */
export default function DevPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Dashboard user={{ id: "dev-preview", name: "Ramesh Patel", email: "", image: "" }} />;
}
