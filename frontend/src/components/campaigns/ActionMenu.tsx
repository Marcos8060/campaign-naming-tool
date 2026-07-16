import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Eye, Copy, Play, Pause, Trash2 } from 'lucide-react';
import type { ActionMenuProps } from '@/types/campaigns';
import { Button } from '@/components/ui/Button';

const menuItemClass = 'w-full justify-start rounded-none px-3 py-2 text-sm font-normal h-auto';
const MENU_WIDTH = 176; // matches w-44

export function ActionMenu({ campaign, onAction }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [measured, setMeasured] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // First pass: place the menu below the trigger so it mounts into the DOM
  // and we can measure its real height (it varies — active campaigns show
  // "Pause", everything else shows "Activate").
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      setMeasured(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 4, left: rect.right - MENU_WIDTH });
  }, [open]);

  // Second pass: now that the menu is actually in the DOM, measure it and
  // flip above the trigger if it would run past the bottom of the viewport.
  // This is the piece that was missing before — the menu always opened
  // downward, so a row near the bottom of the screen ran off the bottom
  // edge instead of appearing above the button.
  useLayoutEffect(() => {
    if (!open || !position || measured) return;
    const trigger = triggerRef.current?.getBoundingClientRect();
    const menu = menuRef.current?.getBoundingClientRect();
    if (!trigger || !menu) return;

    const fitsBelow = window.innerHeight - trigger.bottom >= menu.height + 8;
    setPosition({
      top: fitsBelow ? trigger.bottom + 4 : Math.max(8, trigger.top - menu.height - 4),
      left: trigger.right - MENU_WIDTH,
    });
    setMeasured(true);
  }, [open, position, measured]);

  // Rows near the bottom of the campaigns table sit inside a Card with
  // overflow-hidden (needed so the table's square corners don't poke past
  // the card's rounded corners) — any absolutely-positioned menu there gets
  // clipped by that ancestor regardless of z-index, since overflow-hidden
  // clips before stacking order is even considered. Portaling to <body> with
  // viewport-fixed coordinates escapes every clipping ancestor entirely.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {open && position && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 w-44"
            style={{ top: position.top, left: position.left, visibility: measured ? 'visible' : 'hidden' }}
          >
            <Button
              href={`/campaigns/${campaign.id}`}
              variant="ghost"
              icon={<Eye className="w-4 h-4" />}
              className={`${menuItemClass} text-gray-700`}
            >
              View Details
            </Button>
            <Button
              variant="ghost"
              icon={<Copy className="w-4 h-4" />}
              onClick={() => { onAction('duplicate', campaign.id); setOpen(false); }}
              className={`${menuItemClass} text-gray-700`}
            >
              Duplicate
            </Button>
            {campaign.status === 'active' ? (
              <Button
                variant="ghost"
                icon={<Pause className="w-4 h-4" />}
                onClick={() => { onAction('pause', campaign.id); setOpen(false); }}
                className={`${menuItemClass} text-gray-700`}
              >
                Pause
              </Button>
            ) : campaign.status !== 'archived' && (
              <Button
                variant="ghost"
                icon={<Play className="w-4 h-4" />}
                onClick={() => { onAction('activate', campaign.id); setOpen(false); }}
                className={`${menuItemClass} text-positive hover:bg-positive-soft hover:text-positive`}
              >
                Activate
              </Button>
            )}
            <div className="border-t border-gray-100 my-1" />
            <Button
              variant="ghost"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => { onAction('archive', campaign.id); setOpen(false); }}
              className={`${menuItemClass} text-red-600 hover:bg-red-50 hover:text-red-600`}
            >
              Archive
            </Button>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
