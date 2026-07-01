import { CheckCircle, AlertCircle, Circle } from 'lucide-react';
import type { ValidationCheck } from '@/types/campaign-create';

interface ValidationChecklistProps {
  checks: ValidationCheck[];
}

export function ValidationChecklist({ checks }: ValidationChecklistProps) {
  return (
    <div className="space-y-2">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2 text-sm">
          {c.pass ? (
            <CheckCircle className="w-4 h-4 text-positive flex-shrink-0" />
          ) : c.required ? (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
          )}
          <span className={c.pass ? 'text-gray-700' : c.required ? 'text-red-600' : 'text-gray-400'}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
