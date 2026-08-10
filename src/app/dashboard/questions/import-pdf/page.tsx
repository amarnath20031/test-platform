"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Question = {
  section: string;
  topic: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
};

export default function AIImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    const { data, error } = await supabase
      .from("Test")
      .select("id,title")
      .order("title");

    if (error) {
      console.error("Failed to load tests:", error);
      return;
    }

    setTests(data || []);
  }

  async function handlePDF(selectedFile: File) {
    try {
      setLoading(true);
      setFile(selectedFile);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "/api/questions/upload-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("AI import response:", data);

      if (!response.ok || !data.success) {
        alert(
          data.error ||
            "Failed to process PDF."
        );
        return;
      }

      let extracted: Question[];

      try {
        extracted =
          typeof data.questions === "string"
            ? JSON.parse(data.questions)
            : data.questions;
      } catch (error) {
        console.error(
          "Failed to parse Gemini response:",
          data.questions
        );

        alert(
          "AI returned invalid JSON. Check the browser console."
        );

        return;
      }

      if (!Array.isArray(extracted)) {
        alert(
          "AI did not return a valid question list."
        );
        return;
      }

      const validQuestions = extracted.filter(
        (q: Question) =>
          q.question &&
          q.optionA &&
          q.optionB &&
          q.optionC &&
          q.optionD &&
          ["A", "B", "C", "D"].includes(
            String(q.correctAnswer)
              .trim()
              .toUpperCase()
          )
      );

      if (!validQuestions.length) {
        alert(
          "No valid questions were extracted from the PDF."
        );
        return;
      }

      const normalizedQuestions =
        validQuestions.map((q) => ({
          section: String(q.section || "").trim(),
          topic: String(q.topic || "").trim(),
          question: String(q.question || "").trim(),
          optionA: String(q.optionA || "").trim(),
          optionB: String(q.optionB || "").trim(),
          optionC: String(q.optionC || "").trim(),
          optionD: String(q.optionD || "").trim(),
          correctAnswer: String(
            q.correctAnswer || ""
          )
            .trim()
            .toUpperCase(),
          explanation: String(
            q.explanation || ""
          ).trim(),
        }));

      setQuestions(normalizedQuestions);

      alert(
        `${normalizedQuestions.length} questions extracted successfully!`
      );
    } catch (error) {
      console.error(
        "AI PDF import error:",
        error
      );

      alert(
        "Failed to process PDF."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveQuestions() {
    if (!selectedTest) {
      alert("Please select a test first.");
      return;
    }

    if (!questions.length) {
      alert("No questions to save.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/questions/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testId: selectedTest,
            questions,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Save AI questions response:",
        data
      );

      if (!response.ok || !data.success) {
        alert(
          data.error ||
            "Failed to save questions."
        );
        return;
      }

      alert(
        `${data.totalSaved} questions saved successfully!`
      );

      setQuestions([]);
      setFile(null);
    } catch (error) {
      console.error(
        "Save questions error:",
        error
      );

      alert(
        "Failed to save questions."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-10 text-white">

      <h1 className="text-4xl font-bold mb-10">
        🤖 AI Question Import
      </h1>

      <div className="rounded-3xl bg-slate-900 border border-slate-700 p-10">

        {/* SELECT TEST */}

        <div className="mb-8">

          <label className="block text-white font-bold mb-3">
            Select Test
          </label>

          <select
            value={selectedTest}
            onChange={(e) =>
              setSelectedTest(e.target.value)
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white"
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

        </div>

        {/* PDF UPLOAD */}

        <label
          className="
            h-80
            rounded-3xl
            border-2
            border-dashed
            border-slate-600
            flex
            flex-col
            items-center
            justify-center
            cursor-pointer
            hover:border-purple-500
            transition
          "
        >

          <div className="text-8xl">
            📗
          </div>

          <h2 className="text-3xl font-bold mt-8">
            Upload Question PDF
          </h2>

          <p className="text-slate-400 mt-3">
            AI will extract questions, options,
            answers and topics
          </p>

          <input
  hidden
  type="file"
  accept=".pdf,application/pdf"
  disabled={loading}
  onChange={(e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please upload a PDF file only.");
      e.target.value = "";
      return;
    }

    handlePDF(selected);
  }}
/>

        </label>

        {file && (
          <div className="mt-8 rounded-2xl bg-slate-800 p-6">

            <h3 className="font-bold text-xl">
              Selected File
            </h3>

            <p className="text-purple-400 mt-3">
              {file.name}
            </p>

          </div>
        )}

      </div>

      {/* EXTRACTED QUESTIONS */}

      {questions.length > 0 && (
        <div className="mt-10">

          <h2 className="text-3xl font-bold mb-6">
            AI Extracted Questions ({questions.length})
          </h2>

          <div className="space-y-5">

            {questions.map(
              (q, index) => (

                <div
                  key={index}
                  className="
                    bg-slate-900
                    border
                    border-slate-700
                    rounded-xl
                    p-6
                  "
                >

                  <div className="flex gap-3 mb-4">

                    {q.section && (
                      <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                        {q.section}
                      </span>
                    )}

                    {q.topic && (
                      <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">
                        {q.topic}
                      </span>
                    )}

                  </div>

                  <h3 className="text-xl font-bold mb-4">
                    Question {index + 1}
                  </h3>

                  <p className="mb-4">
                    {q.question}
                  </p>

                  <div className="space-y-2 text-slate-300">

                    <div>
                      A. {q.optionA}
                    </div>

                    <div>
                      B. {q.optionB}
                    </div>

                    <div>
                      C. {q.optionC}
                    </div>

                    <div>
                      D. {q.optionD}
                    </div>

                  </div>

                  <div className="mt-4 text-green-400 font-bold">
                    Answer: {q.correctAnswer}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 text-slate-400">
                      Explanation: {q.explanation}
                    </div>
                  )}

                </div>

              )
            )}

          </div>

          {/* SAVE */}

          <button
            onClick={saveQuestions}
            disabled={loading}
            className="
              mt-10
              bg-purple-600
              hover:bg-purple-700
              disabled:opacity-50
              px-10
              py-5
              rounded-2xl
              font-bold
              text-white
              text-xl
            "
          >

            {loading
              ? "Processing..."
              : "💾 Save All Questions"}

          </button>

        </div>
      )}

    </div>
  );
}