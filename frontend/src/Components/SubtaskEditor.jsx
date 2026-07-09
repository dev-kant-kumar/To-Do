import { useMemo, useState } from "react";
import { ListChecks, Plus, X, Check } from "lucide-react";

/**
 * SubtaskEditor
 * ─────────────────────────────────────────────────────────────────
 * Editable checklist. value is an array of { title, done }.
 * Emits a fresh array via onChange on every mutation.
 *
 * Rows carry a client-only uid for stable React keys (so editing a
 * title doesn't lose focus when the list re-renders). The uid is
 * stripped before calling onChange.
 */

let uidCounter = 0;
const nextUid = () => `st_${Date.now()}_${uidCounter++}`;

export default function SubtaskEditor({ value, onChange, disabled }) {
  // Local rows mirror `value` but keep a stable uid per row.
  const [rows, setRows] = useState(() =>
    (value || []).map((s) => ({ uid: nextUid(), title: s.title || "", done: !!s.done }))
  );
  const [draft, setDraft] = useState("");

  const emit = (nextRows) => {
    setRows(nextRows);
    onChange(nextRows.map(({ title, done }) => ({ title, done })));
  };

  const addSubtask = () => {
    const title = draft.trim();
    if (!title) return;
    emit([...rows, { uid: nextUid(), title, done: false }]);
    setDraft("");
  };

  const toggle = (uid) =>
    emit(rows.map((r) => (r.uid === uid ? { ...r, done: !r.done } : r)));

  const rename = (uid, title) =>
    emit(rows.map((r) => (r.uid === uid ? { ...r, title } : r)));

  const remove = (uid) => emit(rows.filter((r) => r.uid !== uid));

  const doneCount = useMemo(() => rows.filter((r) => r.done).length, [rows]);

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
          <ListChecks size={11} className="text-zinc-500" />
          Subtasks
        </span>
        {rows.length > 0 && (
          <span className="text-[10px] font-semibold text-zinc-500">
            {doneCount}/{rows.length} done
          </span>
        )}
      </div>

      {/* Progress bar */}
      {rows.length > 0 && (
        <div className="h-1 rounded-full bg-zinc-800/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${Math.round((doneCount / rows.length) * 100)}%` }}
          />
        </div>
      )}

      {/* Rows */}
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.uid} className="flex items-center gap-2 group">
            <button
              type="button"
              disabled={disabled}
              onClick={() => toggle(r.uid)}
              title={r.done ? "Mark not done" : "Mark done"}
              className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all focus:outline-none cursor-pointer ${
                r.done
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : "border-zinc-700 text-transparent hover:border-emerald-500/40"
              }`}
            >
              <Check size={12} className="stroke-[3]" />
            </button>
            <input
              type="text"
              value={r.title}
              disabled={disabled}
              onChange={(e) => rename(r.uid, e.target.value)}
              maxLength={200}
              className={`flex-1 min-w-0 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-zinc-700 transition-colors ${
                r.done ? "line-through text-zinc-500" : "text-zinc-200"
              }`}
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => remove(r.uid)}
              title="Remove subtask"
              className="p-1 rounded text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:outline-none cursor-pointer flex-shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Add row */}
      <div className="flex items-center gap-2 pt-0.5">
        <span className="w-5 h-5 rounded-md border border-dashed border-zinc-700 flex items-center justify-center flex-shrink-0 text-zinc-600">
          <Plus size={12} />
        </span>
        <input
          type="text"
          value={draft}
          disabled={disabled}
          placeholder="Add a subtask…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSubtask();
            }
          }}
          className="flex-1 min-w-0 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none border-b border-transparent focus:border-zinc-700 transition-colors"
        />
        {draft.trim() && (
          <button
            type="button"
            onClick={addSubtask}
            className="text-[10px] font-bold text-purple-400 hover:text-purple-300 px-1.5 flex-shrink-0"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
