"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  async function changePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      setLoading(false);
      alert("Please login again.");
      router.push("/student/login");
      return;
    }

    // Verify current password
    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

    if (signInError) {
      setLoading(false);
      alert("Current password is incorrect.");
      return;
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password changed successfully.");

    router.push("/student/profile");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <h1 className="text-3xl font-bold mb-2">
          Change Password
        </h1>

        <p className="text-slate-400 mb-8">
          Update your account password.
        </p>

        {/* Current Password */}

        <div className="mb-5">
          <label className="block mb-2 text-sm text-slate-300">
            Current Password
          </label>

          <div className="flex">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              className="flex-1 rounded-l-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrent(!showCurrent)
              }
              className="px-4 border border-l-0 border-slate-700 rounded-r-xl bg-slate-800"
            >
              {showCurrent ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* New Password */}

        <div className="mb-5">
          <label className="block mb-2 text-sm text-slate-300">
            New Password
          </label>

          <div className="flex">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="flex-1 rounded-l-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowNew(!showNew)
              }
              className="px-4 border border-l-0 border-slate-700 rounded-r-xl bg-slate-800"
            >
              {showNew ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Confirm Password */}

        <div className="mb-8">
          <label className="block mb-2 text-sm text-slate-300">
            Confirm New Password
          </label>

          <div className="flex">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="flex-1 rounded-l-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirm(!showConfirm)
              }
              className="px-4 border border-l-0 border-slate-700 rounded-r-xl bg-slate-800"
            >
              {showConfirm ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <div className="flex gap-4">

          <button
            onClick={() => router.back()}
            className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={changePassword}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-semibold"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>

        </div>

      </div>
    </div>
  );
}