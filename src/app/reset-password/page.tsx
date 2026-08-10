"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function updatePassword() {
    if (!password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully.");

    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <h1 className="text-3xl font-bold text-white">
          Reset Password
        </h1>

        <p className="text-slate-400 mt-3">
          Enter your new password.
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full mt-6 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
          className="w-full mt-4 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
        />

        <button
          onClick={updatePassword}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold text-white"
        >
          {loading
            ? "Updating..."
            : "Update Password"}
        </button>

      </div>

    </div>
  );
}