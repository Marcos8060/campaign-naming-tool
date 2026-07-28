'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isValid } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  disabled?: boolean;
  className?: string;
}

const POPOVER_WIDTH = 280;

export function DatePicker({ value, onChange, placeholder = 'Select date', minDate, disabled, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [measured, setMeasured] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selected = value && isValid(parseISO(value)) ? parseISO(value) : undefined;
  const displayValue = selected ? format(selected, 'MMM d, yyyy') : '';
  const minDateParsed = minDate && isValid(parseISO(minDate)) ? parseISO(minDate) : undefined;

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      setMeasured(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 4, left: rect.left });
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !position || measured) return;
    const trigger = triggerRef.current?.getBoundingClientRect();
    const popover = popoverRef.current?.getBoundingClientRect();
    if (!trigger || !popover) return;

    const fitsBelow = window.innerHeight - trigger.bottom >= popover.height + 8;
    const fitsRight = window.innerWidth - trigger.left >= POPOVER_WIDTH;
    setPosition({
      top: fitsBelow ? trigger.bottom + 4 : Math.max(8, trigger.top - popover.height - 4),
      left: fitsRight ? trigger.left : Math.max(8, window.innerWidth - POPOVER_WIDTH - 8),
    });
    setMeasured(true);
  }, [open, position, measured]);

  useEffect(() => {
    if (!open) return;
    const closeOnScroll = () => setOpen(false);
    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnScroll);
    return () => {
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', closeOnScroll);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between gap-2 border border-gray-300 rounded px-3 py-2 text-sm text-left bg-white',
          'focus:outline-none focus:ring-2 focus:ring-primary transition-colors',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          !displayValue && 'text-gray-400',
          className,
        )}
      >
        <span className="truncate">{displayValue || placeholder}</span>
        <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {open && position && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            ref={popoverRef}
            className="fixed bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3"
            style={{ top: position.top, left: position.left, width: POPOVER_WIDTH, visibility: measured ? 'visible' : 'hidden' }}
          >
            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={selected}
              disabled={minDateParsed ? { before: minDateParsed } : undefined}
              onSelect={(date) => {
                onChange(date ? format(date, 'yyyy-MM-dd') : '');
                setOpen(false);
              }}
              components={{
                IconLeft: () => <ChevronLeft className="w-4 h-4" />,
                IconRight: () => <ChevronRight className="w-4 h-4" />,
              }}
              classNames={{
                root: 'text-sm',
                months: 'flex flex-col',
                month: 'space-y-2',
                caption: 'flex justify-center items-center relative h-8 mb-1',
                caption_label: 'text-sm font-semibold text-gray-900',
                nav: 'flex items-center',
                nav_button: 'h-7 w-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 absolute transition-colors',
                nav_button_previous: 'left-0',
                nav_button_next: 'right-0',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell: 'w-9 h-8 text-xs font-medium text-gray-400 flex items-center justify-center',
                row: 'flex',
                cell: 'w-9 h-9 text-center text-sm relative p-0',
                day: 'w-9 h-9 rounded-lg flex items-center justify-center hover:bg-primary-soft transition-colors',
                day_selected: 'bg-primary text-white hover:bg-primary-hover',
                day_today: 'font-semibold text-primary',
                day_outside: 'text-gray-300',
                day_disabled: 'text-gray-300 line-through hover:bg-transparent cursor-not-allowed',
              }}
            />
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
