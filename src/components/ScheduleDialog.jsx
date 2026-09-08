import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { IconX, IconCheck } from "@tabler/icons-react";
import WheelPicker from "./WheelPicker.jsx";

const popSpring = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 };

/**
 * Asks whether to open the monitor now or count down to a chosen 24-hour
 * time. "No" = go now (onGoNow). "Yes" = start countdown with the picked
 * hour/minute (onSchedule(hour, minute)).
 */
export default function ScheduleDialog({ open, onOpenChange, grade, onGoNow, onSchedule }) {
  const now = new Date();
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());

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
                  className="pointer-events-auto w-full max-w-md dotted-bg rounded-3xl p-8 shadow-xl outline-none"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15, ease: "easeIn" } }}
                  transition={popSpring}
                >
                  <Dialog.Title className="text-2xl font-extrabold text-center mb-1">
                    ตั้งเวลานับถอยหลัง?
                  </Dialog.Title>
                  <Dialog.Description className="text-black/50 font-medium text-center mb-6">
                    เปิดหน้าจอ ม.{grade} ตอนนี้เลย หรือตั้งเวลานับถอยหลัง
                  </Dialog.Description>

                  <WheelPicker
                    hour={hour}
                    minute={minute}
                    onChangeHour={setHour}
                    onChangeMinute={setMinute}
                  />

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                      type="button"
                      onClick={onGoNow}
                      className="h-16 rounded-2xl text-white flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-transform"
                      style={{ backgroundColor: "var(--color-brand-red)" }}
                    >
                      <IconX size={24} stroke={2.5} />
                      <span className="text-sm font-bold">ไม่ (ตอนนี้เลย)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSchedule(hour, minute)}
                      className="h-16 rounded-2xl text-white flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-transform"
                      style={{ backgroundColor: "var(--color-brand-green)" }}
                    >
                      <IconCheck size={24} stroke={3} />
                      <span className="text-sm font-bold">ใช่ (ตั้งเวลา)</span>
                    </button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
