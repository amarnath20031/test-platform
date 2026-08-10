"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AssignTestPage() {
  const { id } = useParams();

  const router = useRouter();

  const [test, setTest] = useState<any>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const [selectedStudents, setSelectedStudents] =
    useState<string[]>([]);

  const [selectedBatch, setSelectedBatch] =
    useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: testData } =
      await supabase
        .from("Test")
        .select(`
          *,
          subject:Subject(name)
        `)
        .eq("id", id)
        .single();

    setTest(testData);

    const { data: studentsData } =
      await supabase
        .from("Student")
        .select(`
          *,
          batch:Batch(name)
        `)
        .order("name");

    const { data: batchesData } =
      await supabase
        .from("Batch")
        .select("*")
        .order("name");

    setStudents(studentsData || []);
    setBatches(batchesData || []);
  }

  async function assign() {
    const response = await fetch("/api/tests/assign", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        testId: id,
        studentIds: selectedStudents,
        batchIds: selectedBatch
          ? [selectedBatch]
          : [],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error);
      return;
    }

    alert("Test Assigned!");

    router.push("/dashboard/tests");
  }

  const filteredStudents =
    useMemo(() => {
      return students.filter((student) =>
        student.name
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }, [students, search]);

    return (
    <div className="min-h-screen bg-[#050816] text-white p-8">

      <button
        onClick={() => router.push("/dashboard/tests")}
        className="text-blue-400 hover:text-blue-300 mb-8"
      >
        ← Back to Tests
      </button>

      {/* Header */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">

        <h1 className="text-4xl font-bold">
          Assign Test
        </h1>

        <p className="text-slate-400 mt-2">
          Assign this test to an entire batch or individual students.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-8">

          <div>

            <p className="text-slate-500 text-sm">
              Test
            </p>

            <h2 className="text-2xl font-bold mt-1">
              {test?.title}
            </h2>

          </div>

          <div>

            <p className="text-slate-500 text-sm">
              Subject
            </p>

            <h2 className="text-2xl font-bold mt-1">
              {test?.subject?.name || "-"}
            </h2>

          </div>

        </div>

      </div>

      {/* Batch */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">

        <h2 className="text-2xl font-bold">
          Assign Entire Batch
        </h2>

        <p className="text-slate-400 mt-2 mb-6">
          Every student in the selected batch will receive this test.
        </p>

        <select
          value={selectedBatch}
          onChange={(e) =>
            setSelectedBatch(e.target.value)
          }
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3"
        >
          <option value="">
            Select Batch
          </option>

          {batches.map((batch) => (

            <option
              key={batch.id}
              value={batch.id}
            >
              {batch.name}
            </option>

          ))}

        </select>

      </div>

      {/* Students */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              Assign Individual Students
            </h2>

            <p className="text-slate-400 mt-2">
              Selected: {selectedStudents.length}
            </p>

          </div>

        </div>

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search students..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 mb-8"
        />

        <div className="grid md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">

          {filteredStudents.map((student) => {

            const selected =
              selectedStudents.includes(student.id);

            return (

              <div
                key={student.id}
                onClick={() => {

                  if (selected) {

                    setSelectedStudents(
                      selectedStudents.filter(
                        (x) => x !== student.id
                      )
                    );

                  } else {

                    setSelectedStudents([
                      ...selectedStudents,
                      student.id,
                    ]);

                  }

                }}
                className={`cursor-pointer rounded-2xl border p-5 transition ${
                  selected
                    ? "border-blue-500 bg-blue-600/10"
                    : "border-slate-700 hover:border-blue-500"
                }`}
              >

                <div className="flex justify-between items-center">

                  <div>

                    <h3 className="font-bold text-lg">
                      {student.name}
                    </h3>

                    <p className="text-slate-400 mt-1">
                      {student.batch?.name || "No Batch"}
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    className="h-5 w-5"
                  />

                </div>

              </div>

            );

          })}

        </div>

        <div className="flex gap-4 mt-10">

          <button
            onClick={assign}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-semibold"
          >
            Assign Test
          </button>

          <button
            onClick={() =>
              router.push("/dashboard/tests")
            }
            className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}