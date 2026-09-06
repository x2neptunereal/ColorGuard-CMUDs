import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { IconAlertTriangle } from "@tabler/icons-react";

const popSpring = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 };

export default function ErrorDialog({ open, onOpenChange, message }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              />
            </Dialog.Overlay>

            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
              <Dialog.Content asChild forceMount onOpenAutoFocus={(e) => e.preventDefault()}>
                <motion.div
                  className="pointer-events-auto w-full max-w-sm rounded-3xl bg-white p-6 md:p-8 shadow-xl outline-none text-center"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15, ease: "easeIn" } }}
                  transition={popSpring}
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
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
