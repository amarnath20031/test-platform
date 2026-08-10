"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [instituteName, setInstituteName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function register() {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Institute Registered Successfully!");

    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-10">

        <h1 className="text-4xl font-bold text-center text-white">
          🚀 Register Institute
        </h1>

        <p className="text-center text-slate-400 mt-2">
          Create your institute account
        </p>

        <div className="mt-10 space-y-5">

          <input
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-4 text-white outline-none focus:border-blue-500"
            placeholder="Institute Name"
            value={instituteName}
            onChange={(e) => setInstituteName(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-4 text-white outline-none focus:border-blue-500"
            placeholder="Admin Name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
          />

          <input
            type="email"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-4 text-white outline-none focus:border-blue-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-4 text-white outline-none focus:border-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-4 text-white outline-none focus:border-blue-500"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            onClick={register}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition rounded-xl py-4 text-xl font-bold text-white"
          >
            {loading ? "Creating..." : "Create Institute"}
          </button>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center">

          <p className="text-slate-400">
            Already have an account?
          </p>

          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Login
          </Link>

          <div className="mt-4">

            <Link
              href="/"
              className="text-slate-500 hover:text-white"
            >
              ← Back to Home
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}