"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getReport } from "@/lib/storage";
import type { SavedReport } from "@/lib/types";
import { useApp } from "./AppProvider";
import ReportView from "./ReportView";

/** Reports live on this device, so the page loads them client-side by id. */
export default function ReportScreen({ id }: { id: string }) {
  const { t, user } = useApp();
  const [report, setReport] = useState<SavedReport | null | undefined>(undefined);
  useEffect(() => {
    setReport(getReport(user.id, id));
  }, [user.id, id]);
  if (report === undefined) return <div className="spinner" aria-busy="true" />;
  if (!report) {
    return (
      <section className="card">
        <p>{t.app.report.notFound}</p>
        <Link className="btn btn-primary" href="/dashboard">{t.app.report.back}</Link>
      </section>
    );
  }
  return <ReportView report={report} />;
}
