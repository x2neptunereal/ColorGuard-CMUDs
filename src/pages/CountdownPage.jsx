import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

function pad2(n) {
  return String(n).padStart(2, "0");
}

/** Next Date matching the given 24h hour/minute — today if still in the
 * future, otherwise tomorrow. */
function computeTarget(hour, minute) {
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

export default function CountdownPage({ grade }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const hour = Math.min(23, Math.max(0, parseInt(params.get("h"), 10) || 0));
  const minute = Math.min(59, Math.max(0, parseInt(params.get("m"), 10) || 0));

  const target = useMemo(() => computeTarget(hour, minute), [hour, minute]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 250);
    return () => clearInterval(id);
  }, [target]);

  const remainingMs = target.getTime() - now.getTime();

  useEffect(() => {
    if (remainingMs <= 0) {
      navigate(`/m${grade}`, { replace: true });
    }
  }, [remainingMs, navigate, grade]);

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const showPopup = totalSeconds <= 10 && totalSeconds >= 0;

  return (
    <div className="dotted-bg min-h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="text-black/40 font-bold uppercase tracking-wide text-lg mb-4">
        รอเปิดหน้าจอ ม.{grade}
      </div>
      <div
        className={`tabular text-[22vw] leading-none font-extrabold transition-colors duration-300 ${
          showPopup ? "text-black/30" : "text-black"
        }`}
      >
        {pad2(now.getHours())}:{pad2(now.getMinutes())}:{pad2(now.getSeconds())}
      </div>
      <div className="text-black/40 font-medium text-xl mt-6">
        เป้าหมาย {pad2(hour)}:{pad2(minute)} น.
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={totalSeconds}
                className="tabular text-white font-extrabold"
                style={{ fontSize: "min(60vw, 480px)" }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.15, transition: { duration: 0.25, ease: "easeIn" } }}
                transition={{ type: "spring", stiffness: 380, damping: 24, mass: 0.9 }}
              >
                {totalSeconds}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
