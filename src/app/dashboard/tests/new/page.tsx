"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewTestPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [positiveMarks, setPositiveMarks] =
    useState(1);

  const [negativeMarks, setNegativeMarks] =
    useState(0);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [subjects, setSubjects] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profile")
      .select("instituteId")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    console.log("Profile:", profile);

const { data: subjectData, error } = await supabase
  .from("Subject")
  .select("*");


console.log(error);

setSubjects(subjectData || []);
  }

  async function createTest() {
    if (!title || !subjectId) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profile")
      .select("instituteId")
      .eq("id", user.id)
      .single();

    const { error } = await supabase
      .from("Test")
      .insert({
        id: crypto.randomUUID(),
        title,
        instituteId: profile?.instituteId,
        subjectId,
        positiveMarks,
        negativeMarks,
        durationHours: hours,
        durationMinutes: minutes,
        durationSeconds: seconds,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard/tests");
  }

    return (
    <div className="min-h-screen bg-[#050816] text-white p-8">

      <button
        onClick={() => router.back()}
        className="text-blue-400 hover:text-blue-300 mb-8"
      >
        ← Back
      </button>

      <div className="max-w-4xl mx-auto">

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

          <h1 className="text-4xl font-bold">
            Create Test
          </h1>

          <p className="text-slate-400 mt-2 mb-10">
            Create a new exam for your institute.
          </p>

          {/* Test Title */}

          <div className="mb-8">

            <label className="block mb-2 text-slate-300">
              Test Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Example: DRDO Final Mock Test"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* Subject */}

          <div className="mb-8">

            <label className="block mb-2 text-slate-300">
              Subject
            </label>


            <select
              value={subjectId}
              onChange={(e) =>
                setSubjectId(e.target.value)
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 outline-none focus:border-blue-500"
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

          </div>

          {/* Marks */}

          <div className="grid md:grid-cols-2 gap-6 mb-8">

            <div>

              <label className="block mb-2 text-slate-300">
                Positive Marks
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="block mb-2 text-slate-300">
                Negative Marks
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* Duration */}

          <div className="mb-10">

            <label className="block mb-4 text-slate-300">
              Duration
            </label>

            <div className="grid grid-cols-3 gap-4">

              <input
                type="number"
                min={0}
                placeholder="Hours"
                value={hours}
                onChange={(e) =>
                  setHours(Number(e.target.value))
                }
                className="bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="number"
                min={0}
                max={59}
                placeholder="Minutes"
                value={minutes}
                onChange={(e) =>
                  setMinutes(
                    Number(e.target.value)
                  )
                }
                className="bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="number"
                min={0}
                max={59}
                placeholder="Seconds"
                value={seconds}
                onChange={(e) =>
                  setSeconds(
                    Number(e.target.value)
                  )
                }
                className="bg-slate-950 border border-slate-700 rounded-xl px-5 py-3 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* Buttons */}

          <div className="flex gap-4">

            <button
              onClick={createTest}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8 py-3 rounded-xl font-semibold transition"
            >
              {loading ? "Saving..." : "Save Test"}
            </button>

            <button
              onClick={() =>
                router.push("/dashboard/tests")
              }
              className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl font-semibold transition"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}