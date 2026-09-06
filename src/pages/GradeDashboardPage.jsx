import { useEffect, useState } from "react";
import { subscribeColorLive, colorGroupLetter } from "../lib/api.js";

export default function GradeDashboardPage({ grade }) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setData(null);
    const unsubscribe = subscribeColorLive(grade, {
      onOpen: () => setConnected(true),
      onData: (payload) => setData(payload),
      onError: () => setConnected(false),
    });
    return unsubscribe;
  }, [grade]);

  const colors = data?.colors ?? [];

  return (
    <div className="dotted-bg min-h-screen w-full flex flex-col p-6 md:p-10">
      <div className="flex items-center justify-center gap-3 mb-8 md:mb-12 relative">
        <h1 className="text-3xl md:text-5xl font-extrabold text-center">
          จำนวนคนที่เหลือ (ม.{grade})
        </h1>
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: connected ? "var(--color-brand-green)" : "var(--color-brand-red)" }}
          title={connected ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
        />
      </div>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {(colors.length ? colors : Array.from({ length: 4 })).map((c, i) => {
          const letter = c ? colorGroupLetter(c.colorGroup) : "ABCD"[i];
          return (
            <div key={letter} className="flex flex-col items-center">
              <div className="font-bold text-xl md:text-3xl mb-3 md:mb-5">Group {letter}</div>
              <div className="w-full flex-1 bg-white rounded-3xl border border-black/5 shadow-sm flex items-center justify-center min-h-[40vh]">
                <span className="text-7xl md:text-9xl font-extrabold tabular">
                  {c ? c.remaining : "–"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {data?.totalStudents != null && (
        <div className="text-center text-black/40 font-semibold mt-8 md:mt-10 text-sm md:text-base">
          ทั้งหมด {data.totalStudents} คน
        </div>
      )}
    </div>
  );
}
