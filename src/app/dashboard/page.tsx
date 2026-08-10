"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profile")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role?.toLowerCase() === "institute") {
        router.replace("/dashboard/institute");
      } else if (profile?.role?.toLowerCase() === "student") {
        router.push("/student");
      } else {
        router.replace("/login");
      }
    }

    load();
  }, [router]);

  return <div className="p-10">Loading dashboard...</div>;
}