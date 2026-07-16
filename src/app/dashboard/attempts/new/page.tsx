"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NewAttemptPage() {
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);

  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [studentId, setStudentId] = useState("");
  const [testId, setTestId] = useState("");

  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

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

    if (studentData) setStudents(studentData);
    if (testData) setTests(testData);
  }

  async function loadQuestions(id: string) {
    setSubmitted(false);
    setTestId(id);

    const selectedTest = tests.find(
      (t) => t.id === id
    );

    if (selectedTest) {
      const totalSeconds =
        (selectedTest.durationHours || 0) *
          3600 +
        (selectedTest.durationMinutes || 0) *
          60 +
        (selectedTest.durationSeconds || 0);

      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
    }

    const { data } = await supabase
      .from("Question")
      .select(
        `
        *,
        options:Option(*)
      `
      )
      .eq("testId", id);

    if (data) {
      setQuestions(
        data.map((q) => ({
          ...q,
          selectedOption: "",
        }))
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

    alert(
      `Test Submitted!

Score: ${score}

Correct: ${correctAnswers}

Wrong: ${wrongAnswers}

Skipped: ${skippedAnswers}

Percentage: ${percentage.toFixed(
        2
      )}%

Time Taken:
${Math.floor(timeTaken / 60)}m ${
        timeTaken % 60
      }s`
    );

    setTimeLeft(0);
setQuestions([]);
submittingRef.current = true;
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
        <select
          className="border p-3 rounded w-full"
          value={studentId}
          onChange={(e) =>
            setStudentId(
              e.target.value
            )
          }
        >
          <option value="">
            Select Student
          </option>

          {students.map((student) => (
            <option
              key={student.id}
              value={student.id}
            >
              {student.name}
            </option>
          ))}
        </select>

        <select
          className="border p-3 rounded w-full"
          value={testId}
          onChange={(e) =>
            loadQuestions(
              e.target.value
            )
          }
        >
          <option value="">
            Select Test
          </option>

          {tests.map((test) => (
            <option
              key={test.id}
              value={test.id}
            >
              {test.title}
            </option>
          ))}
        </select>

        {questions.map(
          (question, index) => (
            <div
              key={question.id}
              className="border p-4 rounded"
            >
              <p className="font-bold mb-4">
                {index + 1}.{" "}
                {question.text}
              </p>

              {question.options.map(
                (option: any) => (
                  <label
                    key={option.id}
                    className="block mb-2"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      onChange={() => {
                        setQuestions(
                          (prev) =>
                            prev.map(
                              (q) =>
                                q.id ===
                                question.id
                                  ? {
                                      ...q,
                                      selectedOption:
                                        option.id,
                                    }
                                  : q
                            )
                        );
                      }}
                    />

                    <span className="ml-2">
                      {option.text}
                    </span>
                  </label>
                )
              )}
            </div>
          )
        )}

        {questions.length >
          0 && (
          <button
            disabled={submitted}
            onClick={submitTest}
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
      </div>
    </div>
  );
}