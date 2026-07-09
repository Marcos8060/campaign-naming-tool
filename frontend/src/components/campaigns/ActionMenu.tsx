import { useState } from 'react';
import { MoreHorizontal, Eye, Copy, Play, Pause, Trash2 } from 'lucide-react';
import type { ActionMenuProps } from '@/types/campaigns';
import { Button } from '@/components/ui/Button';

const menuItemClass = 'w-full justify-start rounded-none px-3 py-2 text-sm font-normal h-auto';

export function ActionMenu({ campaign, onAction }: ActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="rounded-lg"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 w-44">
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
      )}
    </div>
  );
}
