import { IconUserCircle } from "@tabler/icons-react";

export default function StudentCard({ student }) {
  const fullName = [student.title, student.name, student.lastName].filter(Boolean).join(" ");
  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 flex items-center gap-4">
      <div className="shrink-0 w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
        <IconUserCircle size={26} stroke={1.6} className="text-black/50" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-lg truncate">{fullName || "-"}</div>
        <div className="text-black/50 text-sm">
          <span className="text-black/40">รหัส: </span>
          {student.studentId}
        </div>
        <div className="text-black/50 text-sm">
          ม.{student.grade}/{student.classroom} · เลขที่ {student.studentNumber}
        </div>
      </div>
    </div>
  );
}
