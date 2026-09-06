import * as Dialog from "@radix-ui/react-dialog";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function ErrorDialog({ open, onOpenChange, message }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 bg-black/40" />
        <Dialog.Content
          className="dialog-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm rounded-3xl bg-white p-6 md:p-8 shadow-xl outline-none text-center"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#ffecec" }}
          >
            <IconAlertTriangle size={30} stroke={2} style={{ color: "var(--color-brand-red-dark)" }} />
          </div>

          <Dialog.Title className="text-xl font-extrabold mb-1">เกิดข้อผิดพลาด</Dialog.Title>
          <Dialog.Description className="text-black/60 font-medium mb-6">{message}</Dialog.Description>

          <Dialog.Close asChild>
            <button
              type="button"
              className="w-full h-14 rounded-2xl font-bold text-white shadow-sm active:scale-[0.98] transition-transform"
              style={{ backgroundColor: "var(--color-brand-red)" }}
            >
              ตกลง
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
