import * as Dialog from "@radix-ui/react-dialog";
import { IconX, IconCheck } from "@tabler/icons-react";

function Field({ label, value }) {
  return (
    <div className="text-xl md:text-2xl font-bold leading-relaxed">
      <span className="text-black/40">{label}: </span>
      <span className="text-black">{value}</span>
    </div>
  );
}

export default function StudentConfirmDialog({ open, onOpenChange, group, student, onConfirm, onCancel, confirming = false }) {
  if (!student) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 bg-black/40" />
        <Dialog.Content
          className="dialog-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl dotted-bg rounded-3xl p-8 md:p-12 shadow-xl outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="text-4xl md:text-5xl font-extrabold text-center mb-6 md:mb-8">
            Group {group}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            ยืนยันการมอบหมายนักเรียนเข้ากลุ่ม {group}
          </Dialog.Description>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8 space-y-3">
            <Field label="รหัสนักเรียน" value={student.studentId} />
            <Field label="ชื่อ" value={student.name} />
            <Field label="ห้องเรียน" value={student.classRoom} />
            <Field label="เลขที่" value={student.studentNumber} />
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={onCancel}
                disabled={confirming}
                className="h-16 md:h-20 rounded-2xl text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50"
                style={{ backgroundColor: "var(--color-brand-red)" }}
                aria-label="ยกเลิก"
              >
                <IconX size={34} stroke={2.5} />
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirming}
              className="h-16 md:h-20 rounded-2xl text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50"
              style={{ backgroundColor: "var(--color-brand-green)" }}
              aria-label="ยืนยัน"
            >
              <IconCheck size={36} stroke={3} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
