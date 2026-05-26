"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteStudent } from "./actions";

export default function DeleteStudentButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(() => deleteStudent(studentId));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Trash2 size={14} />
        מחיקת מטופל
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">מחיקת מטופל</h2>
            <p className="text-sm text-gray-600 mb-6">
              האם אתה בטוח שברצונך למחוק את{" "}
              <span className="font-semibold text-gray-900">{studentName}</span>?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                ביטול
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {isPending ? "מוחק..." : "מחק"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
