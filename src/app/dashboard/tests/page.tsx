"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function TestsPage() {
  const router = useRouter();

  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: testsData } = await supabase
      .from("Test")
      .select(`
        *,
        institute:Institute(name),
        subject:Subject(name),
        questions:Question(id)
      `)
      .order("createdAt", {
        ascending: false,
      });

    const { data: attemptsData } =
      await supabase
        .from("Attempt")
        .select("*");

    const { data: assignmentData } =
      await supabase
        .from("TestAssignment")
        .select("*");

    setTests(testsData || []);
    setAttempts(attemptsData || []);
    setAssignments(assignmentData || []);
  }

  async function deleteTest(id: string) {
    if (!confirm("Delete this test?")) return;

    const response = await fetch(
      `/api/tests/${id}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (!result.success) {
      alert(result.error);
      return;
    }

    setTests((prev) =>
      prev.filter((t) => t.id !== id)
    );
  }

  function duplicateTest(test: any) {
    router.push(
      `/dashboard/tests/new?duplicate=${test.id}`
    );
  }

  function getAssignments(testId: string) {
    return assignments.filter(
      (a) => a.testId === testId
    ).length;
  }

  function getAttempts(testId: string) {
  return attempts.filter(
    (a) =>
      a.testId === testId &&
      a.isPractice !== true
  );
}

  function getAverage(testId: string) {
    const list = getAttempts(testId);

    if (!list.length) return 0;

    return Math.round(
      list.reduce(
        (sum, a) =>
          sum + Number(a.percentage),
        0
      ) / list.length
    );
  }

  const filteredTests = useMemo(() => {
    return tests.filter((test) =>
      test.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [tests, search]);

  const totalTests = tests.length;

  const totalAssignments =
    assignments.length;

  const officialAttempts =
  attempts.filter(
    (a) => a.isPractice !== true
  );

const totalAttempts =
  officialAttempts.length;

const averageScore =
  officialAttempts.length === 0
    ? 0
    : Math.round(
        officialAttempts.reduce(
          (sum, a) =>
            sum +
            Number(a.percentage || 0),
          0
        ) / officialAttempts.length
      );

          return (
    <div className="min-h-screen bg-[#050816] text-white p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-5xl font-bold">
            Tests
          </h1>

          <p className="text-gray-400 mt-2">
            Manage tests, assignments and reports.
          </p>

        </div>

        <Link
          href="/dashboard/tests/new"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
        >
          + Add Test
        </Link>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <p className="text-gray-400">
            Total Tests
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalTests}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <p className="text-gray-400">
            Assigned Tests
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalAssignments}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <p className="text-gray-400">
            Attempts
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalAttempts}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <p className="text-gray-400">
            Average %
          </p>

          <h2 className="text-4xl font-bold mt-2 text-green-400">
            {averageScore}%
          </h2>
        </div>

      </div>

      {/* Search */}

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search tests..."
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 mb-8 outline-none focus:border-blue-500"
      />

      {/* Cards */}

      <div className="space-y-6">

        {filteredTests.map((test) => {

          const testAttempts =
            getAttempts(test.id);

          return (

            <div
              key={test.id}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition"
            >

              <div className="flex flex-col lg:flex-row justify-between gap-6">

                <div>

                  <h2 className="text-2xl font-bold">
                    {test.title}
                  </h2>

                  <p className="text-gray-400 mt-2">
                    🏫 {test.institute?.name}
                  </p>

                  <p className="text-gray-400">
                    📚 {test.subject?.name}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">

                    <div>

                      <p className="text-gray-500 text-sm">
                        Questions
                      </p>

                      <p className="text-2xl font-bold">
                        {test.questions?.length || 0}
                      </p>

                    </div>

                    <div>

                      <p className="text-gray-500 text-sm">
                        Assigned
                      </p>

                      <p className="text-2xl font-bold text-blue-400">
                        {getAssignments(test.id)}
                      </p>

                    </div>

                    <div>

                      <p className="text-gray-500 text-sm">
                        Attempts
                      </p>

                      <p className="text-2xl font-bold">
                        {testAttempts.length}
                      </p>

                    </div>

                    <div>

                      <p className="text-gray-500 text-sm">
                        Average
                      </p>

                      <p className="text-2xl font-bold text-green-400">
                        {getAverage(test.id)}%
                      </p>

                    </div>

                  </div>

                </div>

                <div className="flex flex-wrap gap-3 h-fit">

                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/tests/${test.id}`
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl"
                  >
                    Assign
                  </button>

                  <button
                    onClick={() => alert("Duplicate Test - Coming Soon")}
                    className="bg-violet-600 hover:bg-violet-700 px-5 py-2 rounded-xl"
                  >
                    Duplicate
                  </button>

                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/reports/${test.id}`
                      )
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-xl"
                  >
                    Report
                  </button>

                  <button
                    onClick={() =>
                      deleteTest(test.id)
                    }
                    className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          );

        })}

        {filteredTests.length === 0 && (

          <div className="text-center text-gray-400 py-20">

            No tests found.

          </div>

        )}

      </div>

    </div>
  );
}
