import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IconDeviceIpad, IconDeviceDesktop, IconChevronRight, IconSearch, IconX } from "@tabler/icons-react";
import PageShell from "../components/PageShell.jsx";
import ScheduleDialog from "../components/ScheduleDialog.jsx";
import StudentCard from "../components/StudentCard.jsx";
import { searchStudents } from "../lib/api.js";

const DEBOUNCE_MS = 350;

const GRADE_LINKS = [1, 2, 3, 4].map((g) => ({
  grade: g,
  label: `ม.${g}`,
  desc: `หน้าจอแสดงจำนวนคนที่เหลือ ม.${g}`,
}));

function NavCard({ to, onClick, icon, title, desc }) {
  const content = (
    <>
      <div className="shrink-0 w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-lg">{title}</div>
        <div className="text-black/50 text-sm truncate">{desc}</div>
      </div>
      <IconChevronRight className="text-black/30 group-hover:translate-x-0.5 transition-transform" />
    </>
  );
  const className =
    "group flex w-full items-center gap-4 bg-white rounded-2xl border border-black/5 shadow-sm p-5 hover:shadow-md active:scale-[0.98] transition-all text-left";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  return (
    <Link to={to} className={className}>
      {content}
    </Link>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [scheduleGrade, setScheduleGrade] = useState(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const isSearching = query.trim().length > 0;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setSearched(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const data = await searchStudents(trimmed, { signal: controller.signal });
        setResults(data);
        setSearched(true);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        setError(err?.message || "ค้นหาไม่สำเร็จ");
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <PageShell>
      <div className="animate-fade-in-up w-full max-w-lg">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-1">Color Guard</h1>
        <h1 className="text-1xl md:text-2xl font-extrabold text-center mb-1">CMUDs 2026 - Demon55</h1>
        <p className="text-center text-black/50 mb-8">เลือกหน้าที่ต้องการเปิด</p>

        <div className="relative mb-3">
          <IconSearch
            size={20}
            stroke={2}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
          />
          <input
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อ หรือ รหัสนักเรียน"
            className="w-full h-14 rounded-2xl bg-white border border-black/5 shadow-sm pl-12 pr-11 font-medium outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center active:scale-95 transition-transform"
              aria-label="ล้างการค้นหา"
            >
              <IconX size={16} stroke={2.2} className="text-black/50" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isSearching ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-3 pb-2"
            >
              {loading && (
                <div className="text-center text-black/40 font-medium py-6 animate-pulse">กำลังค้นหา...</div>
              )}

              {!loading && error && (
                <div
                  className="text-center font-medium py-6"
                  style={{ color: "var(--color-brand-red-dark)" }}
                >
                  {error}
                </div>
              )}

              {!loading && !error && searched && results.length === 0 && (
                <div className="text-center text-black/40 font-medium py-6">ไม่พบนักเรียนที่ค้นหา</div>
              )}

              {!loading &&
                !error &&
                results.map((student) => <StudentCard key={student.id || student.studentId} student={student} />)}
            </motion.div>
          ) : (
            <motion.div
              key="nav"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-3"
            >
              <NavCard
                to="/assign"
                icon={<IconDeviceIpad size={26} stroke={1.8} />}
                title="มอบหมายกลุ่ม (Assign)"
                desc="สำหรับ iPad แนวนอน — กรอกรหัสนักเรียนเพื่อมอบหมายเข้ากลุ่มของอุปกรณ์นี้"
              />

              <div className="pt-2 pb-1 px-1 text-xs font-bold uppercase tracking-wide text-black/40">
                หน้าจอแสดงผล (Monitor)
              </div>

              {GRADE_LINKS.map((g) => (
                <NavCard
                  key={g.grade}
                  onClick={() => setScheduleGrade(g.grade)}
                  icon={<IconDeviceDesktop size={26} stroke={1.8} />}
                  title={g.label}
                  desc={g.desc}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ScheduleDialog
        open={scheduleGrade !== null}
        onOpenChange={(v) => {
          if (!v) setScheduleGrade(null);
        }}
        grade={scheduleGrade}
        onGoNow={() => {
          const g = scheduleGrade;
          setScheduleGrade(null);
          navigate(`/m${g}`);
        }}
        onSchedule={(hour, minute) => {
          const g = scheduleGrade;
          setScheduleGrade(null);
          navigate(`/m${g}/countdown?h=${hour}&m=${minute}`);
        }}
      />
    </PageShell>
  );
}
