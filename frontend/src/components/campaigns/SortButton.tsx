import { ChevronUp, ChevronDown } from 'lucide-react';
import type { SortButtonProps } from '@/types/campaigns';
import { Button } from '@/components/ui/Button';

export function SortButton({ column, current, order, onClick }: SortButtonProps) {
  const active = current === column;
  return (
    <Button
      variant="text"
      onClick={() => onClick(column)}
      className="gap-1 text-inherit hover:text-gray-900 transition-colors group"
    >
      {column.replace('_', ' ')}
      <span className={active ? 'text-primary' : 'text-gray-300 group-hover:text-gray-500'}>
        {active && order === 'asc'
          ? <ChevronUp className="w-3 h-3" />
          : <ChevronDown className="w-3 h-3" />}
      </span>
    </Button>
  );
}
