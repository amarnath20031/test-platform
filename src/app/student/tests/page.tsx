"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function StudentTestsPage() {
  const router = useRouter();

  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
const [selectedTestId, setSelectedTestId] = useState("");
const [studentId, setStudentId] = useState("");

  useEffect(() => {
    loadTests();
  }, []);

  async function handlePracticeAgain(testId: string) {
  const { data: session } = await supabase
    .from("ExamSession")
    .select("*")
    .eq("studentId", studentId)
    .eq("testId", testId)
    .maybeSingle();

  if (session) {
    setSelectedTestId(testId);
    setShowResumeDialog(true);
  } else {
    router.push(`/student/test/${testId}`);
  }
}

async function resumeTest() {
  router.push(`/student/test/${selectedTestId}`);
}

async function startNewAttempt() {
  const { error: sessionError } = await supabase
    .from("ExamSession")
    .delete()
    .eq("studentId", studentId)
    .eq("testId", selectedTestId);

  console.log("DELETE SESSION:", sessionError);

  const { error: draftError } = await supabase
    .from("DraftAnswer")
    .delete()
    .eq("studentId", studentId)
    .eq("testId", selectedTestId);

  console.log("DELETE DRAFT:", draftError);

  setShowResumeDialog(false);

  router.replace(`/student/test/${selectedTestId}`);
  router.refresh();
}

  async function loadTests() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/student/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profile")
      .select("studentId")
      .eq("id", user.id)
      .single();

    if (!profile?.studentId) {
      router.push("/student/login");
      return;
    }
    setStudentId(profile.studentId);

    const { data: assignments, error } = await supabase
      .from("TestAssignment")
      .select(`
        *,
        Test (
          id,
          title,
          durationHours,
          durationMinutes,
          durationSeconds,
          Subject (
            name
          ),
          Question (
            id
          )
        )
      `)
      .eq("studentId", profile.studentId);

    if (error) {
      console.error("Error loading tests:", error);
    }

    setTests(assignments || []);
    setLoading(false);
  }

  function startTest(testId: string) {
    router.push(`/student/test/${testId}/instructions`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">
          Loading tests...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-5xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-8">
          📚 My Tests
        </h1>

        {tests.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
            <p className="text-gray-400 text-lg">
              No assigned tests.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {tests.map((item: any) => {

              const test = item.Test;

              return (
                <div
                  key={item.id}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg"
                >

                  <h2 className="text-2xl font-bold text-white mb-5">
                    {test?.title}
                  </h2>

                  <div className="space-y-2 text-gray-300">

                    <p>
                      <span className="font-semibold text-white">
                        Subject :
                      </span>{" "}
                      {test?.Subject?.name ?? "--"}
                    </p>

                    <p>
                      <span className="font-semibold text-white">
                        Questions :
                      </span>{" "}
                      {test?.Question?.length ?? "--"}
                    </p>

                    <p>
                      <span className="font-semibold text-white">
                        Duration :
                      </span>{" "}
                      {test?.durationHours ?? 0}h{" "}
                      {test?.durationMinutes ?? 0}m{" "}
                      {test?.durationSeconds ?? 0}s
                    </p>

                    <p>
                      <span className="font-semibold text-white">
                        Assigned :
                      </span>{" "}
                      {item.assignedAt
                        ? new Date(
                            item.assignedAt
                          ).toLocaleDateString("en-GB")
                        : "--"}
                    </p>

                  </div>

                  <div className="mt-6">

                    {item.status === "completed" ? (
                      <>
                        <p className="text-green-400 font-bold mb-4">
                          ✅ Completed
                        </p>

                        <div className="grid grid-cols-2 gap-3">

                          <button
                            onClick={() => {
                              if (item.attemptId) {
                                router.push(
                                  `/result/${item.attemptId}`
                                );
                              }
                            }}
                            disabled={!item.attemptId}
                            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
                          >
                            View Result
                          </button>

                          <button
  onClick={() => handlePracticeAgain(test.id)}
  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl"
>
                            Practice Again
                          </button>

                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-green-400 font-bold mb-4">
                          🟢 Assigned
                        </p>

                        <button
                          onClick={() => {
                            startTest(test.id);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition"
                        >
                          Start Test
                        </button>
                      </>
                    )}

                  </div>
                  

                </div>
              );
            })}

          </div>
        )}
        {showResumeDialog && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-slate-900 rounded-2xl p-8 w-[500px] border border-slate-700">

     <h2 className="text-2xl font-bold mb-4">
Continue Practice?
</h2>

<p className="text-slate-300 mb-8">
You can continue your previous session or start a completely new attempt.
</p>

      <div className="space-y-4">

        <button
          onClick={resumeTest}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold"
        >
          Resume Test
        </button>

        <button
          onClick={startNewAttempt}
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold"
        >
          Start New Attempt
        </button>

        <button
          onClick={() => setShowResumeDialog(false)}
          className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl"
        >
          Cancel
        </button>

      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
}