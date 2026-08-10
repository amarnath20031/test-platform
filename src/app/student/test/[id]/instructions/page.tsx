"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function InstructionsPage() {
  const router = useRouter();
  const params = useParams();

  const testId = params.id as string;

  const [test, setTest] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);


  useEffect(() => {
  async function loadTest() {

    // Check if student already completed this test
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/student/login");
      return;
    }


    // Load test
    const { data: testData, error } = await supabase
      .from("Test")
      .select("*")
      .eq("id", testId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    // Count questions
    const { count } = await supabase
      .from("Question")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("testId", testId);

    setTest({
      ...testData,
      totalQuestions: count || 0,
    });
  }

  if (testId) {
    loadTest();
  }

}, [testId, router]);

  if (!test) {
    return (
      <div className="p-8 text-center text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">

      {/* Heading */}
      <h1 className="text-4xl font-bold mb-8">
        {test.title}
      </h1>

      {/* Test Information */}
      <div className="border rounded-xl p-6 mb-8">

        <h2 className="text-2xl font-semibold mb-5">
          Test Information
        </h2>

        <div className="space-y-2">

          <p>
            <strong>Questions :</strong>{" "}
            {test.totalQuestions}
          </p>

          <p>
            <strong>Duration :</strong>{" "}
            {test.durationHours || 0}h{" "}
            {test.durationMinutes || 0}m{" "}
            {test.durationSeconds || 0}s
          </p>

          <p>
            <strong>Positive Marks :</strong>{" "}
            {test.positiveMarks}
          </p>

          {test.negativeMarks > 0 && (
            <p>
              <strong>Negative Marks :</strong>{" "}
              {test.negativeMarks}
            </p>
          )}

        </div>

      </div>

      {/* Instructions */}
      <div className="border rounded-xl p-6">

        <h2 className="text-2xl font-semibold mb-5">
          Instructions
        </h2>

        <ul className="list-disc pl-6 space-y-3">

          <li>
            The timer starts immediately after clicking Start Test.
          </li>

          <li>
            You cannot pause the exam.
          </li>

          <li>
            Do not refresh the page during the test.
          </li>

          {test.negativeMarks > 0 && (
            <li>
              Negative marking of{" "}
              <strong>{test.negativeMarks}</strong>{" "}
              marks is applicable for every wrong answer.
            </li>
          )}

          <li>
            You can navigate between questions anytime.
          </li>

          <li>
            You can mark questions for review.
          </li>

          <li>
            Your answers are automatically saved.
          </li>

          <li>
            The test will automatically submit when the timer reaches zero.
          </li>

        </ul>

        {/* Checkbox */}
        <div className="mt-8">

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) =>
                setAccepted(e.target.checked)
              }
            />

            I have read and understood all the instructions.

          </label>

        </div>

        {/* Button */}
        <button
          disabled={!accepted}
          onClick={() =>
            router.push(`/student/test/${testId}`)
          }
          className={`mt-8 px-8 py-3 rounded-lg text-white font-semibold transition ${
            accepted
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-500 cursor-not-allowed"
          }`}
        >
          Start Test
        </button>

      </div>

    </div>
  );
}