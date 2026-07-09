import { type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent: string;
}

export function KpiCard({ title, value, sub, icon: Icon, accent }: KpiCardProps) {
  return (
    <Card variant="elevated" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + '18' }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
      </div>
    </Card>
  );
}
