import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconArrowLeft, IconAlertTriangle, IconDeviceIpad } from "@tabler/icons-react";
import PageShell from "../components/PageShell.jsx";
import Keypad from "../components/Keypad.jsx";
import StudentConfirmDialog from "../components/StudentConfirmDialog.jsx";
import { getStoredDevice, storeDevice } from "../lib/device.js";
import { registerDevice, getStudent, assignColor, colorGroupLetter, ApiError } from "../lib/api.js";

function DeviceSetup({ onRegistered }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const device = await registerDevice(name.trim());
      storeDevice(device);
      onRegistered(device);
    } catch (err) {
      setError(err.message || "ลงทะเบียนอุปกรณ์ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-black/5 p-6 md:p-8">
        <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mb-4">
          <IconDeviceIpad size={26} stroke={1.8} />
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold mb-1">ตั้งค่าอุปกรณ์นี้</h1>
        <p className="text-black/50 text-sm mb-5">ตั้งชื่ออุปกรณ์ (ครั้งแรกเท่านั้น) ระบบจะกำหนดกลุ่มสีให้อัตโนมัติ</p>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="เช่น iPad โต๊ะ 1"
          className="w-full h-14 rounded-2xl border border-black/10 px-4 text-lg font-semibold mb-4 outline-none focus:border-black/30"
        />

        {error && (
          <div className="flex items-center gap-1.5 text-sm font-semibold mb-4" style={{ color: "var(--color-brand-red-dark)" }}>
            <IconAlertTriangle size={16} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="w-full h-14 rounded-2xl font-bold text-white shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
          style={{ backgroundColor: "var(--color-brand-green)" }}
        >
          {busy ? "กำลังลงทะเบียน..." : "เริ่มใช้งาน"}
        </button>
      </form>
    </PageShell>
  );
}

export default function AssignPage() {
  const [device, setDevice] = useState(() => getStoredDevice());
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [dialogStudent, setDialogStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 2500);
    return () => clearTimeout(t);
  }, [flash]);

  if (!device) {
    return <DeviceSetup onRegistered={setDevice} />;
  }

  const groupLetter = colorGroupLetter(device.colorGroup);

  const reset = () => {
    setDigits("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!digits || lookingUp) return;
    setError("");
    setLookingUp(true);
    try {
      const student = await getStudent(digits);
      setDialogStudent(student);
      setDialogOpen(true);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404 ? "ไม่พบรหัสนักเรียนนี้" : err.message || "ค้นหาไม่สำเร็จ");
    } finally {
      setLookingUp(false);
    }
  };

  const handleConfirm = async () => {
    if (!dialogStudent) return;
    setConfirming(true);
    try {
      const result = await assignColor(dialogStudent.studentId, device.id);
      setDialogOpen(false);
      reset();
      setFlash(`มอบหมายแล้ว • Group ${colorGroupLetter(result.colorGroup)} (ม.${result.grade}) เหลือ ${result.remaining} คน`);
    } catch (err) {
      setError(err.message || "มอบหมายไม่สำเร็จ");
      setDialogOpen(false);
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    reset();
  };

  return (
    <PageShell>
      <div className="w-full flex flex-col items-center">
        <Link
          to="/"
          className="absolute left-4 top-4 md:left-6 md:top-6 flex items-center gap-1 text-black/40 hover:text-black/70 font-semibold text-sm"
        >
          <IconArrowLeft size={18} />
          กลับ
        </Link>

        <span className="text-xs font-bold tracking-wide text-black/40 mb-1">{device.name}</span>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Group {groupLetter}</h1>

        <Keypad
          value={digits}
          onDigit={(d) => digits.length < 6 && setDigits((v) => v + d)}
          onBackspace={() => setDigits((v) => v.slice(0, -1))}
          onSubmit={handleSubmit}
          disabled={dialogOpen || lookingUp}
        />

        <div className="h-8 mt-3 flex items-center justify-center text-center">
          {error && (
            <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--color-brand-red-dark)" }}>
              <IconAlertTriangle size={16} />
              {error}
            </div>
          )}
          {!error && flash && <div className="text-sm font-semibold text-black/60">{flash}</div>}
        </div>
      </div>

      <StudentConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={groupLetter}
        student={dialogStudent}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirming={confirming}
      />
    </PageShell>
  );
}
