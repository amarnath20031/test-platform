"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewTestPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [positiveMarks, setPositiveMarks] =
    useState(1);

  const [negativeMarks, setNegativeMarks] =
    useState(0);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [institutes, setInstitutes] = useState<any[]>(
    []
  );

  const [subjects, setSubjects] = useState<any[]>(
    []
  );

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: instituteData } =
      await supabase
        .from("Institute")
        .select("*")
        .order("name");

    const { data: subjectData } =
      await supabase
        .from("Subject")
        .select("*")
        .order("name");

    if (instituteData) {
      setInstitutes(instituteData);
    }

    if (subjectData) {
      setSubjects(subjectData);
    }
  }

  async function createTest() {
    if (
      !title ||
      !instituteId ||
      !subjectId
    ) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("Test")
      .insert([
        {
          id: crypto.randomUUID(),
          title,
          instituteId,
          subjectId,

          positiveMarks,
          negativeMarks,

          durationHours: hours,
          durationMinutes: minutes,
          durationSeconds: seconds,
        },
      ]);

    setLoading(false);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    router.push("/dashboard/tests");
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Add Test
      </h1>

      <div className="space-y-4">
        <input
          className="border p-3 rounded w-full"
          placeholder="Test Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <div>
          <label className="block mb-1 font-medium">
            Positive Marks per Correct Answer
          </label>

          <input
            type="number"
            step="0.25"
            value={positiveMarks}
            onChange={(e) =>
              setPositiveMarks(
                Number(e.target.value)
              )
            }
            className="border p-3 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Negative Marks per Wrong Answer
          </label>

          <input
            type="number"
            step="0.25"
            value={negativeMarks}
            onChange={(e) =>
              setNegativeMarks(
                Number(e.target.value)
              )
            }
            className="border p-3 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Time Limit
          </label>

          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              placeholder="HH"
              value={hours}
              onChange={(e) =>
                setHours(
                  Number(e.target.value)
                )
              }
              className="border p-3 rounded w-full"
            />

            <input
              type="number"
              min={0}
              max={59}
              placeholder="MM"
              value={minutes}
              onChange={(e) =>
                setMinutes(
                  Number(e.target.value)
                )
              }
              className="border p-3 rounded w-full"
            />

            <input
              type="number"
              min={0}
              max={59}
              placeholder="SS"
              value={seconds}
              onChange={(e) =>
                setSeconds(
                  Number(e.target.value)
                )
              }
              className="border p-3 rounded w-full"
            />
          </div>
        </div>

        <select
          className="border p-3 rounded w-full"
          value={instituteId}
          onChange={(e) =>
            setInstituteId(
              e.target.value
            )
          }
        >
          <option value="">
            Select Institute
          </option>

          {institutes.map(
            (institute) => (
              <option
                key={institute.id}
                value={institute.id}
              >
                {institute.name}
              </option>
            )
          )}
        </select>

        <select
          className="border p-3 rounded w-full"
          value={subjectId}
          onChange={(e) =>
            setSubjectId(
              e.target.value
            )
          }
        >
          <option value="">
            Select Subject
          </option>

          {subjects.map((subject) => (
            <option
              key={subject.id}
              value={subject.id}
            >
              {subject.name}
            </option>
          ))}
        </select>

        <button
          onClick={createTest}
          disabled={loading}
          className="bg-black text-white px-5 py-3 rounded"
        >
          {loading
            ? "Saving..."
            : "Save Test"}
        </button>
      </div>
    </div>
  );
}