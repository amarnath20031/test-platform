"use client";

import { useEffect, useState } from "react";

import { loadAnalytics } from "@/lib/analytics/loadAnalytics";

import OverviewCards from "./components/OverviewCards";
import QuestionInsights from "./components/QuestionInsights";
import SubjectAnalytics from "./components/SubjectAnalytics";
import TopicAnalytics from "./components/TopicAnalytics";
import BatchComparison from "./components/BatchComparison";
import StudentsNeedingAttention from "./components/StudentsNeedingAttention";
import FacultyInsights from "./components/FacultyInsights";
import { buildAnalytics } from "@/lib/analytics/buildAnalytics";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const rawData = await loadAnalytics();

      const analytics = buildAnalytics(rawData);

      setData(analytics);

      setLoading(false);
    }

    init();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] text-white p-10">
        Loading Analytics...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white p-8">
      <h1 className="text-5xl font-bold mb-10">
        📊 Institute Analytics
      </h1>

      {data && (
        <OverviewCards data={data} />
      )}
      <QuestionInsights
  data={data.questionInsights}
/>

<SubjectAnalytics
  data={data.subjectAnalytics}
/>

<TopicAnalytics
  data={data.topicAnalytics}
/>

<BatchComparison
  data={data.batchComparison}
/>

<StudentsNeedingAttention
  data={data.studentsAtRisk}
/>

<FacultyInsights
  data={data.facultyInsights}
/>
    </main>
  );
}