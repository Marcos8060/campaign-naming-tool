import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Eye, Copy, Play, Pause, Trash2 } from 'lucide-react';
import type { ActionMenuProps } from '@/types/campaigns';

export function ActionMenu({ campaign, onAction }: ActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 w-44">
          <Link
            href={`/campaigns/${campaign.id}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" /> View Details
          </Link>
          <button
            onClick={() => { onAction('duplicate', campaign.id); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Copy className="w-4 h-4" /> Duplicate
          </button>
          {campaign.status === 'active' ? (
            <button
              onClick={() => { onAction('pause', campaign.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          ) : campaign.status !== 'archived' && (
            <button
              onClick={() => { onAction('activate', campaign.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-positive hover:bg-positive-soft"
            >
              <Play className="w-4 h-4" /> Activate
            </button>
          )}
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => { onAction('archive', campaign.id); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Archive
          </button>
        </div>
      )}
    </div>
  );
}
