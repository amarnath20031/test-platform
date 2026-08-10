"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendResetEmail() {
    if (!email) {
      alert("Enter your email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          "http://localhost:3000/reset-password",
      }
    );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <h1 className="text-3xl font-bold text-white">
          Forgot Password
        </h1>

        <p className="text-slate-400 mt-3">
          Enter your registered email address.
        </p>

        {sent ? (

          <div className="mt-6 bg-green-900/30 border border-green-700 rounded-xl p-4 text-green-300">
            Password reset email sent.
            Please check your inbox.
          </div>

        ) : (

          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full mt-6 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />

            <button
              onClick={sendResetEmail}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold text-white"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </>

        )}

        <Link
          href="/login"
          className="block text-center text-blue-400 mt-6"
        >
          Back to Login
        </Link>

      </div>

    </div>
  );
}