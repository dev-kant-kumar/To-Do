import { Repeat } from "lucide-react";

/**
 * RecurrencePicker
 * ─────────────────────────────────────────────────────────────────
 * Compact control for a recurrence rule.
 *
 * value: { frequency: "none"|"daily"|"weekly"|"monthly",
 *          interval: number, daysOfWeek: number[], endDate: string|null }
 */

const FREQUENCIES = [
  { key: "none", label: "None" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const UNIT = { daily: "day", weekly: "week", monthly: "month" };
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const emptyRecurrence = () => ({
  frequency: "none",
  interval: 1,
  daysOfWeek: [],
  endDate: null,
});

/** Human-readable summary of a recurrence rule (e.g. "Every 2 weeks on Mon, Fri"). */
export function describeRecurrence(rec) {
  if (!rec || rec.frequency === "none" || !rec.frequency) return null;
  const n = rec.interval > 1 ? `${rec.interval} ` : "";
  const unit = UNIT[rec.frequency] + (rec.interval > 1 ? "s" : "");
  let text = `Every ${n}${unit}`;
  if (rec.frequency === "weekly" && rec.daysOfWeek?.length) {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const picked = [...rec.daysOfWeek].sort((a, b) => a - b).map((d) => names[d]);
    text += ` on ${picked.join(", ")}`;
  }
  return text;
}

export default function RecurrencePicker({ value, onChange, disabled }) {
  const rec = value || emptyRecurrence();
  const set = (patch) => onChange({ ...rec, ...patch });

  const toggleDay = (d) => {
    const has = rec.daysOfWeek?.includes(d);
    const days = has
      ? rec.daysOfWeek.filter((x) => x !== d)
      : [...(rec.daysOfWeek || []), d].sort((a, b) => a - b);
    set({ daysOfWeek: days });
  };

  return (
    <div className="space-y-2.5 text-left">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
        <Repeat size={11} className="text-zinc-500" />
        Repeat
      </span>

      {/* Frequency segmented control */}
      <div className="flex rounded-xl overflow-hidden border border-zinc-800/60 bg-zinc-900/30 p-1 h-9">
        {FREQUENCIES.map((f) => {
          const isActive = (rec.frequency || "none") === f.key;
          return (
            <button
              key={f.key}
              type="button"
              disabled={disabled}
              onClick={() => set({ frequency: f.key })}
              className={`flex-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border border-transparent transition-all duration-300 focus:outline-none cursor-pointer disabled:opacity-50 ${
                isActive
                  ? "bg-purple-500/15 border-purple-500/25 text-purple-300 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {rec.frequency && rec.frequency !== "none" && (
        <div className="space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-3">
          {/* Interval */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium">Every</span>
            <input
              type="number"
              min={1}
              max={365}
              value={rec.interval || 1}
              disabled={disabled}
              onChange={(e) => set({ interval: Math.max(1, Math.min(365, parseInt(e.target.value, 10) || 1)) })}
              className="w-14 px-2 py-1 bg-zinc-900/50 text-zinc-100 rounded-lg border border-zinc-800/60 focus:border-[#9040dd] focus:outline-none text-center text-xs font-semibold"
            />
            <span className="font-medium">
              {UNIT[rec.frequency]}
              {(rec.interval || 1) > 1 ? "s" : ""}
            </span>
          </div>

          {/* Weekday selector */}
          {rec.frequency === "weekly" && (
            <div className="flex items-center gap-1">
              {WEEKDAYS.map((w, i) => {
                const isOn = rec.daysOfWeek?.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDay(i)}
                    title={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i]}
                    className={`w-7 h-7 rounded-lg text-[10px] font-extrabold transition-all focus:outline-none cursor-pointer ${
                      isOn
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-950/40"
                        : "bg-zinc-900/50 text-zinc-500 border border-zinc-800/60 hover:text-zinc-300"
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          )}

          {/* Optional end date */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium">Ends</span>
            <input
              type="date"
              value={rec.endDate ? String(rec.endDate).slice(0, 10) : ""}
              disabled={disabled}
              onChange={(e) => set({ endDate: e.target.value || null })}
              className="px-2 py-1 bg-zinc-900/50 text-zinc-200 rounded-lg border border-zinc-800/60 focus:border-[#9040dd] focus:outline-none text-xs [color-scheme:dark]"
            />
            {rec.endDate ? (
              <button
                type="button"
                onClick={() => set({ endDate: null })}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
              >
                clear
              </button>
            ) : (
              <span className="text-[10px] text-zinc-600">never</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
