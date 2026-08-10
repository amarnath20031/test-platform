"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

export default function NewAttemptPage() {
  const params = useParams();
  const router = useRouter();

  const testIdFromUrl = params.id as string;
  const [showSubmitModal, setShowSubmitModal] =useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);

  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [studentId, setStudentId] = useState("");
  const [currentQuestion, setCurrentQuestion] =
  useState(0);

const [visitedQuestions, setVisitedQuestions] =
  useState<string[]>([]);
  const [markedQuestions, setMarkedQuestions] =
  useState<string[]>([]);
  const [testId, setTestId] = useState("");

  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);

 useEffect(() => {
  if (testIdFromUrl && studentId) {
    loadQuestions(testIdFromUrl);
  }
}, [testIdFromUrl, studentId]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          if (!submitted) {
            submitTest();
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  async function loadData() {
    const { data: studentData } = await supabase
      .from("Student")
      .select("*")
      .order("name");

    const { data: testData } = await supabase
      .from("Test")
      .select("*")
      .order("title");

   if (studentData) {
  setStudents(studentData);

  // Temporary: automatically use the first student
  if (studentData.length > 0) {
    setStudentId(studentData[0].id);
  }
}

if (testData) {
  setTests(testData);
  if (testData) {
  setTests(testData);

  const selected = testData.find(
    (t) => t.id === testIdFromUrl
  );

  if (selected) {
    setTestId(selected.id);
  }
}
}
    if (testIdFromUrl && testData) {
  const selectedTest = testData.find(
    (t) => t.id === testIdFromUrl
  );

  if (selectedTest) {
    setTestId(selectedTest.id);
  }
}
  }

  async function loadQuestions(id: string) {
  setSubmitted(false);
  setTestId(id);

  const { data: session } = await supabase
  .from("ExamSession")
  .select("*")
  .eq("studentId", studentId)
  .eq("testId", id)
  .maybeSingle();

  const selectedTest = tests.find(
    (t) => t.id === id
  );

  if (selectedTest) {

  const totalSeconds =
    (selectedTest.durationHours || 0) * 3600 +
    (selectedTest.durationMinutes || 0) * 60 +
    (selectedTest.durationSeconds || 0);

  if (session) {
    setTimeLeft(session.remainingTime);
    setCurrentQuestion(session.currentQuestion);
    setVisitedQuestions(session.visitedQuestions || []);
    setMarkedQuestions(session.markedQuestions || []);
  } else {
    setTimeLeft(totalSeconds);
    setCurrentQuestion(0);
    setVisitedQuestions([]);
    setMarkedQuestions([]);

    await supabase
      .from("ExamSession")
      .insert({
        studentId,
        testId: id,
        currentQuestion: 0,
        visitedQuestions: [],
        markedQuestions: [],
        remainingTime: totalSeconds,
      });
  }

  setInitialTime(totalSeconds);
}

  // Restore Draft Answers
  const { data: drafts } = await supabase
    .from("DraftAnswer")
    .select("*")
    .eq("studentId", studentId)
    .eq("testId", id);

  const { data } = await supabase
    .from("Question")
    .select(`
      *,
      options:Option(*)
    `)
    .eq("testId", id);

  if (data) {
    setQuestions(
      data.map((q) => ({
        ...q,
        selectedOption:
          drafts?.find(
            (d) =>
              d.questionId === q.id
          )?.optionId || "",
      }))
    );

    setCurrentQuestion(0);

    setVisitedQuestions(
      data.length ? [data[0].id] : []
    );
  }
}

  async function submitTest() {
  if (submittingRef.current) return;

  submittingRef.current = true;

  if (!studentId || !testId) {
    submittingRef.current = false;
    alert("Please select student and test.");
    return;
  }

  setSubmitted(true);

    const selectedTest = tests.find(
      (t) => t.id === testId
    );

    const positive =
      selectedTest?.positiveMarks ?? 1;

    const negative =
      selectedTest?.negativeMarks ?? 0;

    const attemptId = crypto.randomUUID();

    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skippedAnswers = 0;

    questions.forEach((q) => {
      const correct = q.options.find(
        (o: any) => o.isCorrect
      );

      if (!q.selectedOption) {
        skippedAnswers++;
        return;
      }

      if (
        correct &&
        q.selectedOption === correct.id
      ) {
        correctAnswers++;
        score += positive;
      } else {
        wrongAnswers++;
        score -= negative;
      }
    });

    const percentage =
      questions.length > 0
        ? (correctAnswers /
            questions.length) *
          100
        : 0;

    const timeTaken =
      initialTime - timeLeft;

    const { error } = await supabase
      .from("Attempt")
      .insert([
        {
          id: attemptId,
          studentId,
          testId,
          score,
          correctAnswers,
          wrongAnswers,
          skippedAnswers,
          percentage,
          timeTaken,
        },
      ]);

    if (error) {
  setSubmitted(false);
  submittingRef.current = false;
  alert(error.message);
  return;
}

    const { data: attempts } =
      await supabase
        .from("Attempt")
        .select("id, score")
        .eq("testId", testId)
        .order("score", {
          ascending: false,
        });

    if (attempts) {
      for (
        let i = 0;
        i < attempts.length;
        i++
      ) {
        await supabase
          .from("Attempt")
          .update({
            rank: i + 1,
          })
          .eq("id", attempts[i].id);
      }
    }

    for (const q of questions) {
      const correct = q.options.find(
        (o: any) => o.isCorrect
      );

      await supabase
        .from("Answer")
        .insert([
          {
            id: crypto.randomUUID(),
            attemptId,
            questionId: q.id,
            optionId: q.selectedOption,
            isCorrect:
              q.selectedOption ===
              correct?.id,
          },
        ]);
    }

   await supabase
  .from("DraftAnswer")
  .delete()
  .eq("studentId", studentId)
  .eq("testId", testId);

await supabase
  .from("ExamSession")
  .delete()
  .eq("studentId", studentId)
  .eq("testId", testId);

  await supabase
  .from("TestAssignment")
  .update({
    status: "completed",
    attemptId: attemptId,
  })
  .eq("studentId", studentId)
  .eq("testId", testId);

router.push(`/result/${attemptId}`);
  }

  const formattedTime =
    `${Math.floor(timeLeft / 3600)}`
      .padStart(2, "0") +
    ":" +
    `${Math.floor(
      (timeLeft % 3600) / 60
    )}`.padStart(2, "0") +
    ":" +
    `${timeLeft % 60}`.padStart(
      2,
      "0"
    );

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        Take Test
      </h1>

      {timeLeft > 0 && (
        <div
          className={`p-4 rounded-xl text-center shadow-lg mb-4 transition-all duration-300 ${
            timeLeft <= 60
              ? "bg-red-600 text-white animate-pulse"
              : "bg-gray-900 text-red-500 border border-gray-700"
          }`}
        >
          <p
            className={`text-sm ${
              timeLeft <= 60
                ? "text-red-100"
                : "text-gray-300"
            }`}
          >
            Time Left
          </p>

          <p className="text-4xl font-bold tracking-wider">
            {formattedTime}
          </p>
        </div>
      )}

      <div className="space-y-4">

        {questions.length > 0 && (
  <div className="flex gap-6">
    {/* LEFT SIDE */}
    <div className="flex-1 border p-6 rounded-xl">
      <p className="text-xl font-bold mb-6">
        Question {currentQuestion + 1}
      </p>

      <p className="text-lg mb-6">
        {
          questions[currentQuestion]
            ?.text
        }
      </p>

      {questions[
        currentQuestion
      ]?.options.map(
        (option: any) => (
          <label
            key={option.id}
            className="block mb-4"
          >
            <input
              type="radio"
              checked={
                questions[
                  currentQuestion
                ]
                  ?.selectedOption ===
                option.id
              }
             onChange={async () => {
  // Update UI
  setQuestions((prev) =>
    prev.map((q, index) =>
      index === currentQuestion
        ? {
            ...q,
            selectedOption: option.id,
          }
        : q
    )
  );

  // Save draft
  await supabase
    .from("DraftAnswer")
    .upsert({
      studentId,
      testId,
      questionId: questions[currentQuestion].id,
      optionId: option.id,
    });
}}
            />

            <span className="ml-3">
              {option.text}
            </span>
          </label>
        )
      )}

      <div className="flex flex-wrap gap-3 mt-8">
  <button
    disabled={currentQuestion === 0}
    onClick={() =>
      setCurrentQuestion(currentQuestion - 1)
    }
    className="bg-gray-700 text-white px-5 py-3 rounded disabled:opacity-50"
  >
    Previous
  </button>

  <button
    onClick={() => {
      const q =
        questions[currentQuestion];

      if (
        markedQuestions.includes(q.id)
      ) {
        setMarkedQuestions((prev) =>
          prev.filter(
            (id) => id !== q.id
          )
        );
      } else {
        setMarkedQuestions((prev) => [
          ...prev,
          q.id,
        ]);
      }
    }}
    className="bg-purple-600 text-white px-5 py-3 rounded"
  >
    {markedQuestions.includes(
      questions[currentQuestion].id
    )
      ? "Unmark Review"
      : "Mark for Review"}
  </button>

  <button
    onClick={() => {
      setQuestions((prev) =>
        prev.map((q, index) =>
          index === currentQuestion
            ? {
                ...q,
                selectedOption: "",
              }
            : q
        )
      );
    }}
    className="bg-red-600 text-white px-5 py-3 rounded"
  >
    Clear Response
  </button>

  <button
    disabled={
      currentQuestion ===
      questions.length - 1
    }
    onClick={() => {
      const next =
        currentQuestion + 1;

      if (
        !visitedQuestions.includes(
          questions[next].id
        )
      ) {
        setVisitedQuestions((prev) => [
          ...prev,
          questions[next].id,
        ]);
      }

      setCurrentQuestion(next);
    }}
    className="bg-blue-600 text-white px-5 py-3 rounded disabled:opacity-50"
  >
    Save & Next
  </button>
</div>
    </div>

    {/* RIGHT SIDE */}
    <div className="w-72">
      <div className="bg-gray-900 p-5 rounded-xl sticky top-5">
       <h2 className="font-bold mb-5">
  Exam Tools
</h2>

<div className="space-y-2 text-sm mb-5">
  <p>
    Answered: {
      questions.filter(
        (q) => q.selectedOption !== ""
      ).length
    }
  </p>

  <p>
    Not Answered: {
      visitedQuestions.filter(
        (id) =>
          !questions.find(
            (q) =>
              q.id === id &&
              q.selectedOption !== ""
          )
      ).length
    }
  </p>

  <p>
    Not Visited: {
      questions.length -
      visitedQuestions.length
    }
  </p>

  <p>
    Marked: {
      markedQuestions.length
    }
  </p>
</div>


        <div className="grid grid-cols-4 gap-3">
          {questions.map(
            (q, index) => {
              const answered =
                q.selectedOption !== "";

              const visited =
                visitedQuestions.includes(
                  q.id
                );

              let color = "bg-gray-500";

const marked =
  markedQuestions.includes(q.id);

if (answered && marked) {
  color = "bg-amber-600";
} else if (marked) {
  color = "bg-purple-600";
} else if (answered) {
  color = "bg-green-500";
} else if (visited) {
  color = "bg-red-500";
}

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    if (
                      !visitedQuestions.includes(
                        q.id
                      )
                    ) {
                      setVisitedQuestions(
                        (prev) => [
                          ...prev,
                          q.id,
                        ]
                      );
                    }

                    setCurrentQuestion(
                      index
                    );
                  }}
                  className={`${color} h-12 w-12 rounded-lg text-white font-bold`}
                >
                  {index + 1}
                </button>
              );
            }
          )}
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            Answered
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            Visited
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded" />
            Not Visited
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {questions.length >
          0 && (
          <button
            disabled={submitted}
            onClick={() =>
  setShowSubmitModal(true)
}
            className={`px-5 py-3 rounded text-white ${
              submitted
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black"
            }`}
          >
            {submitted
              ? "Submitted"
              : "Submit Test"}
          </button>
        )}

        {showSubmitModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-8 rounded-xl w-112.5 text-white">
      <h2 className="text-2xl font-bold mb-6">
        Submit Test?
      </h2>

      <div className="space-y-3 mb-6">
        <p>
          Answered: {
            questions.filter(
              (q) =>
                q.selectedOption !== ""
            ).length
          }
        </p>

        <p>
          Not Answered: {
            questions.length -
            questions.filter(
              (q) =>
                q.selectedOption !== ""
            ).length
          }
        </p>

        <p>
          Marked For Review: {
            markedQuestions.length
          }
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() =>
            setShowSubmitModal(false)
          }
          className="bg-gray-700 px-5 py-3 rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            setShowSubmitModal(true);
            submitTest();
          }}
          className="bg-red-600 px-5 py-3 rounded"
        >
          Submit Test
        </button>
      </div>
    </div>
  </div>
)}
 </div>
    </div>
  );
}
