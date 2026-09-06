import { IconBackspace, IconCheck } from "@tabler/icons-react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function Keypad({ value, onDigit, onBackspace, onSubmit, maxLength = 6, disabled = false }) {
  const btnBase =
    "h-16 md:h-20 rounded-2xl text-3xl md:text-4xl font-bold bg-white shadow-sm border border-black/5 " +
    "active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100";

  return (
    <div className="w-full max-w-xs md:max-w-sm select-none">
      <div className="h-16 md:h-20 rounded-2xl bg-white border border-black/5 shadow-sm mb-4 flex items-center justify-center">
        <span className="text-3xl md:text-4xl font-bold tabular tracking-widest">
          {value || <span className="text-black/20">&nbsp;</span>}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className={btnBase}
            disabled={disabled || value.length >= maxLength}
            onClick={() => onDigit(k)}
          >
            {k}
          </button>
        ))}

        <button
          type="button"
          className={`${btnBase} bg-brand-red text-white flex items-center justify-center`}
          style={{ backgroundColor: "var(--color-brand-red)" }}
          disabled={disabled || value.length === 0}
          onClick={onBackspace}
          aria-label="ลบ"
        >
          <IconBackspace size={30} stroke={2.2} />
        </button>

        <button
          type="button"
          className={btnBase}
          disabled={disabled || value.length >= maxLength}
          onClick={() => onDigit("0")}
        >
          0
        </button>

        <button
          type="button"
          className={`${btnBase} text-white flex items-center justify-center`}
          style={{ backgroundColor: "var(--color-brand-green)" }}
          disabled={disabled || value.length === 0}
          onClick={onSubmit}
          aria-label="ยืนยัน"
        >
          <IconCheck size={32} stroke={3} />
        </button>
      </div>
    </div>
  );
}
