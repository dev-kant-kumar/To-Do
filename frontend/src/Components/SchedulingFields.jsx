import { Calendar, Bell } from "lucide-react";
import CustomDateTimePicker from "./CustomDateTimePicker";
import RecurrencePicker from "./RecurrencePicker";
import { isRecurring } from "../utils/recurrenceTime";

/**
 * SchedulingFields
 * ─────────────────────────────────────────────────────────────────
 * Repeat-first scheduling. The repeat rule decides which fields show:
 *   • One-time (None) → Due Date & Time + Reminder (full datetimes)
 *   • Recurring       → only a time of day (inside RecurrencePicker);
 *                       due date & reminder are derived from it.
 *
 * Shared by the create and edit forms so behavior stays identical.
 */
export default function SchedulingFields({
  recurrence,
  onRecurrenceChange,
  dueDate,
  onDueDateChange,
  reminderAt,
  onReminderChange,
  minDateTime,
  disabled,
}) {
  const recurring = isRecurring(recurrence);

  return (
    <div className="space-y-5">
      {/* Repeat comes first — it governs everything below */}
      <RecurrencePicker value={recurrence} onChange={onRecurrenceChange} disabled={disabled} />

      {/* One-time tasks get explicit due date & reminder; recurring tasks
          use the time of day picked in the repeat block instead. */}
      {!recurring && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
              <Calendar size={12} className="text-zinc-500" />
              Due Date &amp; Time
            </label>
            <CustomDateTimePicker
              value={dueDate}
              onChange={onDueDateChange}
              min={minDateTime}
              disabled={disabled}
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
              <Bell size={12} className="text-zinc-500" />
              Reminder
            </label>
            <CustomDateTimePicker
              value={reminderAt}
              onChange={onReminderChange}
              min={minDateTime}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
