'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { slugifyCategory } from '@/lib/utils/taxonomy';

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

const POPOVER_MIN_WIDTH = 220;

// A text input that also behaves like a dropdown: click it to see every
// existing option (no need to type anything first), type to filter them
// down, or type something that matches nothing and a clear "+ Create"
// row appears — so both "pick an existing one" and "make a new one" are
// visible at a glance. Replaces a native <input list>/<datalist>, which
// gives no visual hint that typing a new value is possible, and filters
// its suggestions in a way that made an already-filled-in default value
// (e.g. "brand") hide every other real option.
export function Combobox({ value, onChange, options, placeholder, className }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  useLayoutEffect(() => {
    if (!open) { setPosition(null); return; }
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, POPOVER_MIN_WIDTH) });
  }, [open]);

  const draftSlug = slugifyCategory(draft);
  const typed = draft.trim().toLowerCase();
  const filtered = typed ? options.filter((o) => o.includes(typed) || o.includes(draftSlug)) : options;
  const exactMatch = options.includes(draftSlug);
  const showCreateRow = draft.trim().length > 0 && !exactMatch;

  const commit = (val: string) => {
    onChange(val);
    setDraft(val);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setDraft(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (showCreateRow) commit(draftSlug || draft.trim());
              else if (filtered.length) commit(filtered[0]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          className={cn(
            'w-full border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary transition-colors',
            className,
          )}
        />
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {open && position && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-56 overflow-y-auto"
            style={{ top: position.top, left: position.left, width: position.width }}
          >
            {filtered.length === 0 && !showCreateRow && (
              <p className="px-3 py-2 text-sm text-gray-400 italic">No categories yet</p>
            )}
            {filtered.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => commit(o)}
                className="w-full text-left px-3 py-2 text-sm capitalize hover:bg-primary-soft hover:text-primary transition-colors"
              >
                {o}
              </button>
            ))}
            {showCreateRow && (
              <button
                type="button"
                onClick={() => commit(draftSlug || draft.trim())}
                className="w-full flex items-center gap-1.5 text-left px-3 py-2 text-sm text-primary font-medium hover:bg-primary-soft transition-colors border-t border-gray-100"
              >
                <Plus className="w-3.5 h-3.5" /> Create &quot;{draft.trim()}&quot;
              </button>
            )}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
