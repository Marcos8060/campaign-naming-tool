import { ChevronUp, ChevronDown } from 'lucide-react';
import type { SortButtonProps } from '@/types/campaigns';

export function SortButton({ column, current, order, onClick }: SortButtonProps) {
  const active = current === column;
  return (
    <button
      onClick={() => onClick(column)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors group"
    >
      {column.replace('_', ' ')}
      <span className={active ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-500'}>
        {active && order === 'asc'
          ? <ChevronUp className="w-3 h-3" />
          : <ChevronDown className="w-3 h-3" />}
      </span>
    </button>
  );
}
