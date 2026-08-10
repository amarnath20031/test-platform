"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBatchPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function createBatch() {
    if (!name.trim()) {
      alert("Enter batch name");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login again");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("instituteId")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setLoading(false);
      alert("Institute profile not found.");
      return;
    }

    const { error } = await supabase.from("Batch").insert({
      id: crypto.randomUUID(),
      name: name.trim(),
      instituteId: profile.instituteId,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard/batches");
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}

        <div className="mb-10">
          <Link
            href="/dashboard/batches"
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Batches
          </Link>

          <h1 className="text-5xl font-bold mt-4">
            Create Batch
          </h1>

          <p className="text-gray-400 mt-3">
            Create a batch to organize students and assign tests.
          </p>
        </div>

        {/* Form */}

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">

          <label className="block text-gray-300 mb-2">
            Batch Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: DRDO 2026 Morning Batch"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-lg outline-none focus:border-blue-500"
          />

          <p className="text-gray-500 text-sm mt-2">
            Give your batch a unique and meaningful name.
          </p>

          <div className="flex gap-4 mt-10">

            <button
              onClick={createBatch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8 py-3 rounded-xl font-semibold transition"
            >
              {loading ? "Creating..." : "Create Batch"}
            </button>

            <button
              onClick={() => router.push("/dashboard/batches")}
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