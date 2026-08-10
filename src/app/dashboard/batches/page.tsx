"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function getBatches() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("instituteId")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        alert("Institute profile not found.");
        return;
      }

      const { data, error } = await supabase
  .from("Batch")
  .select(`
    *,
    institute:Institute(name),
    students:Student(count)
  `)
  .eq("instituteId", profile.instituteId)
  .order("name");

      if (error) {
        console.error(error);
        return;
      }

      setBatches(data || []);
    }

    getBatches();
  }, []);

  async function deleteBatch(id: string) {
  const batch = batches.find((b) => b.id === id);

  if ((batch?.students?.[0]?.count || 0) > 0) {
    alert(
      "This batch contains students. Remove or move them before deleting the batch."
    );
    return;
  }

  if (!confirm("Delete this batch?")) return;

  const { error } = await supabase
    .from("Batch")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  setBatches((prev) =>
    prev.filter((b) => b.id !== id)
  );
}
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) =>
      batch.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [batches, search]);

  const totalBatches = batches.length;

const totalStudents = batches.reduce(
  (sum, batch) => sum + (batch.students?.[0]?.count || 0),
  0
);

const activeBatches = batches.filter(
  (batch) => (batch.students?.[0]?.count || 0) > 0
).length;

  return (
    <div className="p-8 min-h-screen bg-[#050816] text-white">

      {/* Header */}

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-5xl font-bold">
            Batches
          </h1>

          <p className="text-gray-400 mt-2">
            Manage all batches in your institute.
          </p>
        </div>

        <Link
          href="/dashboard/batches/new"
          className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold transition"
        >
          + Add Batch
        </Link>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-gray-400">
            Total Batches
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalBatches}
          </h2>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-gray-400">
            Total Students
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalStudents}
          </h2>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-gray-400">
            Active Batches
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {activeBatches}
          </h2>
        </div>

      </div>

      {/* Search */}

      <input
        type="text"
        placeholder="Search batches..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 mb-8 outline-none focus:border-blue-500"
      />

      {/* Empty */}

      {filteredBatches.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          No batches found.
        </div>
      )}

      {/* Cards */}

      <div className="space-y-6">

        {filteredBatches.map((batch) => (

          <div
            key={batch.id}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition"
          >

            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">

             <div>

  <h2 className="text-2xl font-bold">
    {batch.name}
  </h2>

  <p className="text-gray-400 mt-1">
    {batch.institute?.name}
  </p>

  <div className="flex gap-10 mt-6">

    <div>
      <p className="text-gray-500 text-sm">
        Students
      </p>

      <p className="text-3xl font-bold text-blue-400">
        {batch.students?.[0]?.count || 0}
      </p>
    </div>

    <div>
      <p className="text-gray-500 text-sm">
        Status
      </p>

      <p
        className={`font-semibold ${
          (batch.students?.[0]?.count || 0) > 0
            ? "text-green-400"
            : "text-red-400"
        }`}
      >
        {(batch.students?.[0]?.count || 0) > 0
          ? "Active"
          : "Empty"}
      </p>
    </div>

  </div>

</div>
<div className="flex flex-wrap gap-3">

  <Link
    href={`/dashboard/batches/${batch.id}`}
    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition"
  >
    View Students
  </Link>

  <Link
    href={`/dashboard/batches/edit/${batch.id}`}
    className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-lg transition"
  >
    Edit
  </Link>

<Link
  href={`/dashboard/batches/${batch.id}`}
  className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg transition"
>
  Analytics
</Link>

  <button
    onClick={() => deleteBatch(batch.id)}
    className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition"
  >
    Delete
  </button>

</div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}