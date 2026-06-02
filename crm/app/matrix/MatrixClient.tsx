"use client";

import { useMemo, useState } from "react";

type Exam = { id: string; parasha: string; exam_date: string | null };
type Score = {
  student_id: string;
  exam_id: string;
  attended_seder: boolean;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    coordinator: { id: string; name: string } | null;
  } | null;
};

type StudentRow = {
  studentId: string;
  name: string;
  examMap: Record<string, boolean | undefined>;
};

type CoordinatorGroup = {
  coordName: string;
  students: StudentRow[];
};

export default function MatrixClient({
  exams,
  scores,
}: {
  exams: Exam[];
  scores: Score[];
}) {
  const [selectedCoord, setSelectedCoord] = useState("");

  const grouped: CoordinatorGroup[] = useMemo(() => {
    const studentMap = new Map<
      string,
      { name: string; coordName: string; examMap: Record<string, boolean> }
    >();

    for (const s of scores) {
      if (!s.student_id || !s.student) continue;
      if (!studentMap.has(s.student_id)) {
        studentMap.set(s.student_id, {
          name: `${s.student.first_name} ${s.student.last_name}`.trim(),
          coordName: s.student.coordinator?.name ?? "ללא משפיע",
          examMap: {},
        });
      }
      studentMap.get(s.student_id)!.examMap[s.exam_id] = s.attended_seder;
    }

    const coordMap = new Map<string, StudentRow[]>();
    for (const [studentId, data] of studentMap.entries()) {
      if (!coordMap.has(data.coordName)) coordMap.set(data.coordName, []);
      coordMap.get(data.coordName)!.push({
        studentId,
        name: data.name,
        examMap: data.examMap,
      });
    }

    return Array.from(coordMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "he"))
      .map(([coordName, students]) => ({
        coordName,
        students: students.sort((a, b) => a.name.localeCompare(b.name, "he")),
      }));
  }, [scores]);

  const coordinatorNames = useMemo(
    () => grouped.map((g) => g.coordName),
    [grouped]
  );

  const filteredGroups = useMemo(
    () =>
      selectedCoord
        ? grouped.filter((g) => g.coordName === selectedCoord)
        : grouped,
    [grouped, selectedCoord]
  );

  return (
    <div>
      <div className="mb-5">
        <select
          value={selectedCoord}
          onChange={(e) => setSelectedCoord(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">כל המשפיעים</option>
          {coordinatorNames.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-8">
        {filteredGroups.map(({ coordName, students }) => (
          <div
            key={coordName}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="bg-[#1e3a5f] px-5 py-3">
              <h2 className="text-white font-semibold text-base">{coordName}</h2>
              <p className="text-blue-300 text-xs mt-0.5">{students.length} בחורים</p>
            </div>
            <div className="overflow-x-auto">
              <table className="text-sm border-collapse" dir="rtl">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-right px-4 py-3 font-semibold text-gray-700 whitespace-nowrap sticky right-0 bg-gray-50 z-10 border-l border-gray-200 min-w-[140px]">
                      שם בחור
                    </th>
                    {exams.map((exam) => (
                      <th
                        key={exam.id}
                        className="text-center px-2 py-3 font-medium text-gray-600 whitespace-nowrap min-w-[80px] border-l border-gray-100"
                        title={
                          exam.exam_date
                            ? new Date(exam.exam_date).toLocaleDateString("he-IL")
                            : ""
                        }
                      >
                        <div className="text-xs font-semibold">{exam.parasha}</div>
                        {exam.exam_date && (
                          <div className="text-gray-400 text-xs font-normal mt-0.5">
                            {new Date(exam.exam_date).toLocaleDateString("he-IL", {
                              month: "numeric",
                              day: "numeric",
                            })}
                          </div>
                        )}
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 font-semibold text-gray-700 whitespace-nowrap min-w-[70px] border-r border-gray-200">
                      % נוכחות
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(({ studentId, name, examMap }, idx) => {
                    const attended = exams.filter(
                      (e) => examMap[e.id] === true
                    ).length;
                    const total = exams.filter(
                      (e) => examMap[e.id] !== undefined
                    ).length;
                    const pct =
                      total > 0 ? Math.round((attended / total) * 100) : 0;
                    const pctColor =
                      pct >= 80
                        ? "text-green-700 bg-green-50"
                        : pct >= 50
                        ? "text-yellow-700 bg-yellow-50"
                        : "text-red-600 bg-red-50";
                    const rowBg = idx % 2 === 1 ? "bg-gray-50" : "bg-white";
                    return (
                      <tr key={studentId} className={rowBg}>
                        <td
                          className={`px-4 py-2.5 text-right font-medium text-gray-800 whitespace-nowrap sticky right-0 z-10 border-l border-gray-200 ${rowBg}`}
                        >
                          {name || "—"}
                        </td>
                        {exams.map((exam) => {
                          const val = examMap[exam.id];
                          return (
                            <td
                              key={exam.id}
                              className="px-2 py-2.5 text-center border-l border-gray-100"
                            >
                              {val === undefined ? (
                                <span className="text-gray-200 text-xs">·</span>
                              ) : val ? (
                                <span className="text-green-600 font-bold text-base">✓</span>
                              ) : (
                                <span className="text-red-300 text-base">✗</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2.5 text-center border-r border-gray-200">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${pctColor}`}
                          >
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
