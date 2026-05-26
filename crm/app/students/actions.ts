"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function deleteStudent(studentId: string) {
  const supabase = await createClient();
  await supabase.from("students").delete().eq("id", studentId);
  redirect("/students");
}
