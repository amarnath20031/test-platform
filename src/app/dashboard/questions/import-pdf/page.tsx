"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

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

export default function ImportExcelPage() {
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

  async function handleExcel(file: File) {
    try {
      setLoading(true);
      setFile(file);

      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        alert("Excel file has no sheets.");
        return;
      }

      const sheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<any>(
        sheet,
        {
          defval: "",
        }
      );

      console.log("Excel rows:", rows);

      if (!rows.length) {
        alert("Excel file is empty.");
        return;
      }

      const extracted: Question[] = rows.map(
        (row: any, index: number) => {
          const question: Question = {
            section: String(
              row.section ??
                row.Section ??
                ""
            ).trim(),

            topic: String(
              row.topic ??
                row.Topic ??
                ""
            ).trim(),

            question: String(
              row.question ??
                row.Question ??
                ""
            ).trim(),

            optionA: String(
              row.optionA ??
                row.OptionA ??
                row["Option A"] ??
                ""
            ).trim(),

            optionB: String(
              row.optionB ??
                row.OptionB ??
                row["Option B"] ??
                ""
            ).trim(),

            optionC: String(
              row.optionC ??
                row.OptionC ??
                row["Option C"] ??
                ""
            ).trim(),

            optionD: String(
              row.optionD ??
                row.OptionD ??
                row["Option D"] ??
                ""
            ).trim(),

            correctAnswer: String(
              row.correctAnswer ??
                row.CorrectAnswer ??
                row["Correct Answer"] ??
                ""
            )
              .trim()
              .toUpperCase(),

            explanation: String(
              row.explanation ??
                row.Explanation ??
                ""
            ).trim(),
          };

          if (!question.question) {
            console.warn(
              `Row ${index + 2} has no question`
            );
          }

          return question;
        }
      );

      const validQuestions = extracted.filter(
        (q) =>
          q.question &&
          q.optionA &&
          q.optionB &&
          q.optionC &&
          q.optionD &&
          ["A", "B", "C", "D"].includes(
            q.correctAnswer
          )
      );

      console.log(
        "Valid questions:",
        validQuestions
      );

      if (!validQuestions.length) {
        alert(
          "No valid questions found. Check your Excel column names."
        );
        return;
      }

      setQuestions(validQuestions);

      alert(
        `${validQuestions.length} questions imported from Excel.`
      );
    } catch (error) {
      console.error(
        "Excel import error:",
        error
      );

      alert(
        "Failed to read Excel file."
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
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            testId: selectedTest,
            questions,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Save response:",
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
        "Save error:",
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
        📥 Excel Question Import
      </h1>

      <div className="rounded-3xl bg-slate-900 border border-slate-700 p-10">

        <div className="mb-8">
          <label className="block text-white font-bold mb-3">
            Select Test
          </label>

          <select
            value={selectedTest}
            onChange={(e) =>
              setSelectedTest(
                e.target.value
              )
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
            hover:border-green-500
            transition
          "
        >
          <div className="text-8xl">
            📊
          </div>

          <h2 className="text-3xl font-bold mt-8">
            Upload Excel
          </h2>

          <p className="text-slate-400 mt-3">
            Upload .xlsx or .xls question file
          </p>

          <input
            hidden
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const selected =
                e.target.files?.[0];

              if (selected) {
                handleExcel(selected);
              }
            }}
          />
        </label>

        {file && (
          <div className="mt-8 rounded-2xl bg-slate-800 p-6">
            <h3 className="font-bold text-xl">
              Selected File
            </h3>

            <p className="text-green-400 mt-3">
              {file.name}
            </p>
          </div>
        )}

      </div>

      {questions.length > 0 && (
        <div className="mt-10">

          <h2 className="text-3xl font-bold mb-6">
            Questions ({questions.length})
          </h2>

          <div className="space-y-5">
            {questions.map(
              (q, index) => (
                <div
                  key={index}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-6"
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
                    Answer:{" "}
                    {q.correctAnswer}
                  </div>
                </div>
              )
            )}
          </div>

          <button
            onClick={saveQuestions}
            disabled={loading}
            className="
              mt-10
              bg-green-600
              hover:bg-green-700
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
              ? "Saving..."
              : "💾 Save All Questions"}
          </button>

        </div>
      )}
    </div>
  );
}