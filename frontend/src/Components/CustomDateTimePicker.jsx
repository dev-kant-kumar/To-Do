import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

// Helper: parse date key to local Date object
const parseValue = (val) => {
  if (!val) {
    const d = new Date();
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5); // Round to nearest 5m
    return d;
  }
  const [datePart, timePart] = val.split("T");
  if (!datePart) return new Date();
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = (timePart || "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

// Helper: pad numbers
const pad = (n) => String(n).padStart(2, "0");

// Helper: convert back to YYYY-MM-DDTHH:mm
const toDateTimeLocalString = (date) => {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
};

export default function CustomDateTimePicker({ value, onChange, min, disabled, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  // Position coordinates for the portal popover
  const [popoverCoords, setPopoverCoords] = useState({ top: 0, left: 0, originY: 0 });

  // Parse initial state from value
  const parsedDate = useMemo(() => parseValue(value), [value]);
  
  // Local active calendar month view state
  const [calendarMonth, setCalendarMonth] = useState(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));

  // Local selection states
  const [selectedDay, setSelectedDay] = useState(parsedDate);
  const [hour12, setHour12] = useState(() => {
    const h = parsedDate.getHours() % 12;
    return h === 0 ? 12 : h;
  });
  const [minutes, setMinutes] = useState(parsedDate.getMinutes());
  const [ampm, setAmpm] = useState(parsedDate.getHours() >= 12 ? "PM" : "AM");

  // Sync state with value prop when value changes externally
  useEffect(() => {
    const d = parseValue(value);
    setSelectedDay(d);
    const h = d.getHours() % 12;
    setHour12(h === 0 ? 12 : h);
    setMinutes(d.getMinutes());
    setAmpm(d.getHours() >= 12 ? "PM" : "AM");
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  // Position calculation
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight = 350; // Approximate height of the popover box
    const popoverWidth = 310;  // Width of popover box
    
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top = rect.bottom + window.scrollY + 6;
    let originY = 0; // for framer-motion zoom origin

    // If space below is too small, position above trigger
    if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
      top = rect.top + window.scrollY - popoverHeight - 6;
      originY = 1;
    }

    let left = rect.left + window.scrollX;
    
    // Adjust horizontally if overflowing window bounds
    if (left + popoverWidth > window.innerWidth) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) left = 12;

    setPopoverCoords({ top, left, originY });
  };

  // Recalculate position when open is toggled
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Listen to scroll and resize to keep position aligned
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        triggerRef.current && triggerRef.current.contains(e.target) ||
        (popoverRef.current && popoverRef.current.contains(e.target))
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Format value to display in trigger button (12-hour format)
  const displayLabel = useMemo(() => {
    if (!value) return "Select date & time";
    const d = parseValue(value);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    const year = d.getFullYear();
    const h = d.getHours() % 12 || 12;
    const m = pad(d.getMinutes());
    const period = d.getHours() >= 12 ? "PM" : "AM";
    return `${month} ${day}, ${year} ${h}:${m} ${period}`;
  }, [value]);

  // Build the calendar days grid
  const daysGrid = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Prev month overflow
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month overflow
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [calendarMonth]);

  // Format month & year header
  const headerLabel = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = (e) => {
    e.preventDefault();
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  // Check if a day is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a day is selected
  const isSelected = (date) => {
    return (
      date.getDate() === selectedDay.getDate() &&
      date.getMonth() === selectedDay.getMonth() &&
      date.getFullYear() === selectedDay.getFullYear()
    );
  };

  // Check if a date-time is disabled (less than min)
  const isDateDisabled = (date) => {
    if (!min) return false;
    const minDate = parseValue(min);
    
    // Check if the date is strictly before the min date (disregarding time)
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const compareMin = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    
    return compareDate < compareMin;
  };

  // Save the selected state to parent
  const handleApply = (e) => {
    if (e) e.preventDefault();
    
    let hours24 = Number(hour12) % 12;
    if (ampm === "PM") hours24 += 12;
    
    const finalDateTime = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate(),
      hours24,
      Number(minutes)
    );

    // If min validation fails, clamp or notify
    if (min) {
      const minDate = parseValue(min);
      if (finalDateTime < minDate) {
        onChange(min);
        setIsOpen(false);
        return;
      }
    }

    onChange(toDateTimeLocalString(finalDateTime));
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    onChange("");
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.preventDefault();
    const today = new Date();
    setSelectedDay(today);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-zinc-900/30 text-zinc-300 rounded-xl border border-zinc-800/60 focus:border-purple-500/40 focus:ring-4 focus:ring-purple-500/5 focus:outline-none text-[11px] font-semibold h-9 transition-all duration-300 cursor-pointer select-none ${className}`}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon size={13} className="text-zinc-500" />
          <span>{displayLabel}</span>
        </span>
        {value && !disabled && (
          <X
            size={13}
            className="text-zinc-500 hover:text-zinc-300 transition-colors z-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        )}
      </button>

      {/* Picker Popover Dialog (Rendered in Portal) */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 pointer-events-none z-[9999]"
        >
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: popoverCoords.originY === 0 ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: popoverCoords.originY === 0 ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute pointer-events-auto w-[310px] bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 text-zinc-100 select-none backdrop-blur-md"
            style={{
              top: popoverCoords.top,
              left: popoverCoords.left,
              colorScheme: "dark",
              transformOrigin: popoverCoords.originY === 0 ? "top center" : "bottom center"
            }}
          >
            {/* Header: Month Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider font-mono text-zinc-400">
                {headerLabel}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-col gap-1">
              {/* Day Labels */}
              <div className="grid grid-cols-7 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <span key={day} className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                    {day}
                  </span>
                ))}
              </div>
              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 mt-1 text-center">
                {daysGrid.map(({ date, isCurrentMonth }, idx) => {
                  const isDisabled = isDateDisabled(date);
                  const isSel = isSelected(date);
                  const isTod = isToday(date);

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isDisabled}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedDay(date);
                      }}
                      className={`h-7 w-7 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                        isDisabled
                          ? "text-zinc-800 bg-transparent cursor-not-allowed"
                          : !isCurrentMonth
                          ? "text-zinc-600 bg-transparent hover:bg-zinc-900/40"
                          : isSel
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                          : isTod
                          ? "border border-purple-500 text-purple-400 hover:bg-purple-500/10"
                          : "text-zinc-300 hover:bg-zinc-900/60"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Picker Block: 12-Hour format */}
            <div className="flex flex-col gap-1.5 border-t border-zinc-900 pt-3">
              <span className="text-[9px] font-black uppercase tracking-wider font-mono text-zinc-500 flex items-center gap-1">
                <Clock size={10} /> Time (12-Hour)
              </span>
              <div className="flex items-center gap-2">
                {/* Hour Select */}
                <select
                  value={hour12}
                  onChange={(e) => setHour12(Number(e.target.value))}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-zinc-200 outline-none focus:border-purple-500/40 cursor-pointer h-7"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>

                <span className="text-zinc-600 font-bold text-xs">:</span>

                {/* Minute Select */}
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-zinc-200 outline-none focus:border-purple-500/40 cursor-pointer h-7"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <option key={m} value={m}>
                      {pad(m)}
                    </option>
                  ))}
                </select>

                {/* AM/PM Switcher Toggle */}
                <div className="flex rounded-xl bg-zinc-900 p-0.5 border border-zinc-800 h-7 select-none">
                  {["AM", "PM"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setAmpm(p);
                      }}
                      className={`px-2 text-[9px] font-black rounded-lg transition-all uppercase cursor-pointer ${
                        ampm === p
                          ? "bg-purple-600 text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-1.5 rounded-xl border border-zinc-800 text-[10px] font-extrabold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="flex-1 py-1.5 rounded-xl border border-zinc-800 text-[10px] font-extrabold text-zinc-400 hover:text-white hover:bg-zinc-900/40 transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-[10px] font-black text-white transition-all shadow-md shadow-purple-600/10 hover:shadow-purple-600/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
