"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SubjectsPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: subjectsData } = await supabase
      .from("Subject")
      .select(`
        *,
        institute:Institute(name)
      `)
      .order("name");

    const { data: testsData } =
      await supabase
        .from("Test")
        .select("id,subjectId");

    const { data: questionData } =
      await supabase
        .from("Question")
        .select(`
          id,
          testId,
          test:Test(subjectId)
        `);

    setSubjects(subjectsData || []);
    setTests(testsData || []);
    setQuestions(questionData || []);
  }

  async function deleteSubject(id: string) {
    if (
      !confirm(
        "Delete this subject and all its tests?"
      )
    )
      return;

    const res = await fetch(
      `/api/subjects/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!data.success) {
      alert(data.error);
      return;
    }

    setSubjects((prev) =>
      prev.filter((s) => s.id !== id)
    );
  }

  function getTests(subjectId: string) {
    return tests.filter(
      (t) => t.subjectId === subjectId
    ).length;
  }

  function getQuestions(subjectId: string) {
    return questions.filter(
      (q: any) =>
        q.test?.subjectId === subjectId
    ).length;
  }

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) =>
      subject.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [subjects, search]);

  const totalSubjects =
    subjects.length;

  const totalTests =
    tests.length;

  const totalQuestions =
    questions.length;

   return (
    <div className="min-h-screen bg-[#050816] text-white p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-5xl font-bold">
            Subjects
          </h1>

          <p className="text-gray-400 mt-2">
            Manage subjects and organize your tests.
          </p>

        </div>

        <Link
          href="/dashboard/subjects/new"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
        >
          + Add Subject
        </Link>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">

          <p className="text-gray-400">
            Total Subjects
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalSubjects}
          </h2>

        </div>

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
            Total Questions
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalQuestions}
          </h2>

        </div>

      </div>

      {/* Search */}

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search subjects..."
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 mb-8 outline-none focus:border-blue-500"
      />

      {/* Cards */}

      <div className="space-y-6">

        {filteredSubjects.map((subject) => (

          <div
            key={subject.id}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition"
          >

            <div className="flex flex-col lg:flex-row justify-between gap-6">

              <div>

                <h2 className="text-2xl font-bold">
                  {subject.name}
                </h2>

                <p className="text-gray-400 mt-2">
                  🏫 {subject.institute?.name}
                </p>

                <div className="grid grid-cols-2 gap-8 mt-6">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Questions
                    </p>

                    <p className="text-3xl font-bold text-blue-400">
                      {getQuestions(subject.id)}
                    </p>

                  </div>

                  <div>

                    <p className="text-gray-500 text-sm">
                      Tests Using Subject
                    </p>

                    <p className="text-3xl font-bold text-green-400">
                      {getTests(subject.id)}
                    </p>

                  </div>

                </div>

              </div>

              <div className="flex gap-3 h-fit">

                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/subjects/edit/${subject.id}`
                    )
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-xl"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteSubject(subject.id)
                  }
                  className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

        {filteredSubjects.length === 0 && (

          <div className="text-center text-gray-400 py-20">

            No subjects found.

          </div>

        )}

      </div>

    </div>
  );
}