"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function EditBatchPage() {
  const { id } = useParams();

  const router = useRouter();

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBatch();
  }, []);

  async function loadBatch() {
    const { data, error } = await supabase
      .from("Batch")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("Batch not found.");
      router.push("/dashboard/batches");
      return;
    }

    setName(data.name);

    setLoading(false);
  }

  async function updateBatch() {
    if (!name.trim()) {
      alert("Enter batch name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("Batch")
      .update({
        name: name.trim(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard/batches");
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

      <div className="max-w-3xl mx-auto">

        <Link
          href="/dashboard/batches"
          className="text-blue-400 hover:text-blue-300"
        >
          ← Back to Batches
        </Link>

        <h1 className="text-5xl font-bold mt-5">
          Edit Batch
        </h1>

        <p className="text-gray-400 mt-3">
          Update your batch information.
        </p>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 mt-10">

          <label className="block mb-3 text-gray-300">
            Batch Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-5 py-4 text-lg outline-none focus:border-blue-500"
          />

          <div className="flex gap-4 mt-10">

            <button
              onClick={updateBatch}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8 py-3 rounded-xl font-semibold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={() =>
                router.push("/dashboard/batches")
              }
              className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl font-semibold"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}