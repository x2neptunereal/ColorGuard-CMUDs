import * as Dialog from "@radix-ui/react-dialog";
import { IconX, IconCheck } from "@tabler/icons-react";

export default function StudentConfirmDialog({ open, onOpenChange, group, student, onConfirm, onCancel, confirming = false }) {
  if (!student) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md dotted-bg rounded-3xl p-6 md:p-8 shadow-xl outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="text-2xl md:text-3xl font-extrabold text-center mb-5">
            Group {group}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            ยืนยันการมอบหมายนักเรียนเข้ากลุ่ม {group}
          </Dialog.Description>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 md:p-6 space-y-2 text-base md:text-lg">
            <div>
              <span className="font-bold">รหัสนักเรียน:</span> {student.studentId}
            </div>
            <div>
              <span className="font-bold">ชื่อ:</span> {student.name}
            </div>
            <div>
              <span className="font-bold">ห้องเรียน:</span> {student.classRoom}
            </div>
            <div>
              <span className="font-bold">เลขที่:</span> {student.studentNumber}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={onCancel}
                disabled={confirming}
                className="h-14 rounded-2xl text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50"
                style={{ backgroundColor: "var(--color-brand-red)" }}
                aria-label="ยกเลิก"
              >
                <IconX size={28} stroke={2.5} />
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirming}
              className="h-14 rounded-2xl text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50"
              style={{ backgroundColor: "var(--color-brand-green)" }}
              aria-label="ยืนยัน"
            >
              <IconCheck size={30} stroke={3} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
