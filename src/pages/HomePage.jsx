import { Link } from "react-router-dom";
import { IconDeviceIpad, IconDeviceDesktop, IconChevronRight } from "@tabler/icons-react";
import PageShell from "../components/PageShell.jsx";

const GRADE_LINKS = [1, 2, 3, 4].map((g) => ({
  to: `/m${g}`,
  label: `ม.${g}`,
  desc: `หน้าจอแสดงจำนวนคนที่เหลือ ม.${g}`,
}));

function NavCard({ to, icon, title, desc }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 bg-white rounded-2xl border border-black/5 shadow-sm p-5 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="shrink-0 w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-lg">{title}</div>
        <div className="text-black/50 text-sm truncate">{desc}</div>
      </div>
      <IconChevronRight className="text-black/30 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <PageShell>
      <div className="animate-fade-in-up w-full max-w-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-1">Color Guard MorChor</h1>
        <p className="text-center text-black/50 mb-8">เลือกหน้าที่ต้องการเปิด</p>

        <div className="space-y-3">
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
              key={g.to}
              to={g.to}
              icon={<IconDeviceDesktop size={26} stroke={1.8} />}
              title={g.label}
              desc={g.desc}
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
