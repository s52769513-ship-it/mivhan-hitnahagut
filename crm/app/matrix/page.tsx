import { createClient } from "@/lib/supabase/server";
import MatrixClient from "./MatrixClient";
import { LayoutGrid } from "lucide-react";

export default async function MatrixPage() {
  const supabase = await createClient();

  const { data: exams } = await supabase
    .from("exams")
    .select("id, parasha, exam_date")
    .order("exam_date", { ascending: false });

  const { data: scores } = await supabase
    .from("scores")
    .select(
      "student_id, exam_id, attended_seder, student:students(id, first_name, last_name, coordinator:coordinators(id, name))"
    );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-2">
          <LayoutGrid size={28} />
          מטריצת נוכחות
        </h1>
        <p className="text-gray-500 mt-1">נוכחות בחורים לפי פרשה — מקובץ לפי משפיע</p>
      </div>
      <MatrixClient exams={exams ?? []} scores={(scores ?? []) as any[]} />
    </div>
  );
}
