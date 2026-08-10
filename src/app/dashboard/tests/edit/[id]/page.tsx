"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function EditTestPage() {
  const { id } = useParams();

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profile")
      .select("instituteId")
      .eq("id", user.id)
      .single();

    const { data: subjectData } = await supabase
      .from("Subject")
      .select("*")
      .eq("instituteId", profile?.instituteId)
      .order("name");

    setSubjects(subjectData || []);

    const { data: test } = await supabase
      .from("Test")
      .select("*")
      .eq("id", id)
      .single();

    if (!test) {
      alert("Test not found");
      router.push("/dashboard/tests");
      return;
    }

    setTitle(test.title);
    setSubjectId(test.subjectId);

    setPositiveMarks(test.positiveMarks);
    setNegativeMarks(test.negativeMarks);

    setHours(test.durationHours);
    setMinutes(test.durationMinutes);
    setSeconds(test.durationSeconds);

    setLoading(false);
  }

  async function updateTest() {
    if (!title || !subjectId) {
      alert("Please fill all fields.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("Test")
      .update({
        title,
        subjectId,

        positiveMarks,
        negativeMarks,

        durationHours: hours,
        durationMinutes: minutes,
        durationSeconds: seconds,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard/tests");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        Loading...
      </div>
    );
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
            Edit Test
          </h1>

          <p className="text-slate-400 mt-2 mb-10">
            Update your test settings.
          </p>

          <div className="space-y-8">

            <div>

              <label className="block mb-2">
                Test Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3"
              />

            </div>

            <div>

              <label className="block mb-2">
                Subject
              </label>

              <select
                value={subjectId}
                onChange={(e) =>
                  setSubjectId(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3"
              >

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

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <label className="block mb-2">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3"
                />

              </div>

              <div>

                <label className="block mb-2">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-3"
                />

              </div>

            </div>

            <div>

              <label className="block mb-4">
                Duration
              </label>

              <div className="grid grid-cols-3 gap-4">

                <input
                  type="number"
                  value={hours}
                  onChange={(e) =>
                    setHours(Number(e.target.value))
                  }
                  placeholder="Hours"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-5 py-3"
                />

                <input
                  type="number"
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(Number(e.target.value))
                  }
                  placeholder="Minutes"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-5 py-3"
                />

                <input
                  type="number"
                  value={seconds}
                  onChange={(e) =>
                    setSeconds(Number(e.target.value))
                  }
                  placeholder="Seconds"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-5 py-3"
                />

              </div>

            </div>

            <div className="flex gap-4">

              <button
                onClick={updateTest}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-semibold"
              >
                {saving ? "Saving..." : "Save Changes"}
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

      </div>

    </div>
  );
}