import { useState } from "react";
import { Tag as TagIcon, X } from "lucide-react";
import { tagStyle, normalizeTag } from "../utils/tagColors";

/**
 * TagInput
 * ─────────────────────────────────────────────────────────────────
 * Chip-based tag editor. value is a string[]. Emits a fresh array via
 * onChange. Add on Enter or comma; remove with the chip's × or by
 * backspacing on an empty input.
 */
const MAX_TAGS = 15;

export default function TagInput({ value, onChange, disabled }) {
  const tags = value || [];
  const [draft, setDraft] = useState("");

  const add = (raw) => {
    const tag = normalizeTag(raw);
    if (!tag) return;
    if (tags.some((x) => x.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    if (tags.length >= MAX_TAGS) return;
    onChange([...tags, tag]);
    setDraft("");
  };

  const remove = (tag) => onChange(tags.filter((x) => x !== tag));

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      remove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2 text-left">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
        <TagIcon size={11} className="text-zinc-500" />
        Tags
      </span>

      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-zinc-900/30 rounded-xl border border-zinc-800/60 focus-within:border-[#9040dd] transition-colors min-h-[42px]">
        {tags.map((tag) => (
          <span
            key={tag}
            style={tagStyle(tag)}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => remove(tag)}
                className="hover:opacity-70 focus:outline-none cursor-pointer"
                title={`Remove ${tag}`}
              >
                <X size={11} />
              </button>
            )}
          </span>
        ))}
        <input
          type="text"
          value={draft}
          disabled={disabled || tags.length >= MAX_TAGS}
          placeholder={tags.length === 0 ? "Add tags (Enter or comma)…" : ""}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          className="flex-1 min-w-[90px] bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
        />
      </div>
    </div>
  );
}
