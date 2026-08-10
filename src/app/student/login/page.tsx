"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function StudentLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Later we'll check role here
    router.push("/student");
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-10">

        <h1 className="text-4xl font-bold text-center text-white">
          👨‍🎓 Student Login
        </h1>

        <p className="text-center text-slate-400 mt-2">
          Login to attend your assigned tests
        </p>

        <div className="mt-10 space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-4 text-white outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-4 text-white outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="text-right mt-2">
  <a
    href="/forgot-password"
    className="text-sm text-blue-400 hover:underline"
  >
    Forgot Password?
  </a>
</div>

          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-4 text-xl font-bold text-white"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center">

          <Link
            href="/"
            className="text-slate-500 hover:text-white"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </main>
  );
}