"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ExcelImportPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [file, setFile] = useState<File | null>(null);
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
      console.error("LOAD TESTS ERROR:", error);
      return;
    }

    setTests(data || []);
  }

  async function handleImport() {
    if (!selectedTest) {
      alert("Please select a test.");
      return;
    }

    if (!file) {
      alert("Please select an Excel file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("testId", selectedTest);

      console.log("Uploading Excel...");

      const response = await fetch(
        "/api/questions/import",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("STATUS:", response.status);

      const data = await response.json();

      console.log("IMPORT RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(
          data.error ||
            "Excel import failed."
        );
        return;
      }

      alert(
        `${data.totalSaved} questions imported successfully!`
      );

      setFile(null);
    } catch (error) {
      console.error(
        "EXCEL IMPORT ERROR:",
        error
      );

      alert("Excel import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-10">
        📥 Excel Question Import
      </h1>

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-10">

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

        <div className="mb-8">
          <label className="block text-white font-bold mb-3">
            Excel File
          </label>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const selected =
                e.target.files?.[0];

              if (selected) {
                setFile(selected);
              }
            }}
            className="w-full text-white bg-slate-800 border border-slate-700 rounded-xl p-4"
          />
        </div>

        {file && (
          <div className="mb-8 bg-slate-800 rounded-xl p-5">
            <p className="text-slate-400">
              Selected File
            </p>

            <p className="text-green-400 font-bold mt-2">
              {file.name}
            </p>
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Required Excel Columns
          </h2>

          <div className="grid md:grid-cols-2 gap-3 text-slate-300">
            <p>• Section</p>
            <p>• Topic</p>
            <p>• Question</p>
            <p>• Option A</p>
            <p>• Option B</p>
            <p>• Option C</p>
            <p>• Option D</p>
            <p>• Correct Answer</p>
            <p>• Explanation</p>
          </div>
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white py-5 rounded-2xl text-xl font-bold"
        >
          {loading
            ? "Importing..."
            : "📥 Import Questions"}
        </button>
      </div>
    </div>
  );
}