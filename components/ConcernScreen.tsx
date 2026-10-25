"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getReport } from "@/lib/storage";
import type { Explanation } from "@/lib/types";
import { useApp } from "./AppProvider";
import Consult from "./Consult";

export default function ConcernScreen({ reportId }: { reportId?: string }) {
  const { t, lang, user } = useApp();
  const router = useRouter();
  const [report, setReport] = useState<Explanation | null>(null);
  useEffect(() => {
    setReport(reportId ? getReport(user.id, reportId)?.result ?? null : null);
  }, [reportId, user.id]);
  return <Consult lang={lang} t={t} report={report} onBack={() => router.push("/dashboard")} />;
}
