import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import type { OnboardingStatus } from '@/types';
import { Card } from '@/components/ui/Card';

const STEPS: { key: keyof OnboardingStatus; label: string; href: string | null }[] = [
  { key: 'workspace_created',      label: 'Workspace set up',           href: null },
  { key: 'taxonomies_configured',  label: 'Configure taxonomies',       href: '/taxonomies' },
  { key: 'platforms_configured',   label: 'Set platform templates',     href: '/settings/platforms' },
  { key: 'first_campaign_created', label: 'Launch your first campaign', href: '/campaigns/create' },
];

interface OnboardingChecklistProps {
  onboarding: OnboardingStatus | undefined;
}

export function OnboardingChecklist({ onboarding }: OnboardingChecklistProps) {
  if (!onboarding) return null;

  const done = STEPS.filter((s) => onboarding[s.key]).length;
  const total = STEPS.length;
  if (done === total) return null;

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <div className="primary-gradient px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-white" />
            <div>
              <p className="font-bold text-white text-sm">Getting Started</p>
              <p className="text-blue-100 text-xs">{done} of {total} steps complete</p>
            </div>
          </div>
          <div className="text-white font-extrabold text-lg">{Math.round((done / total) * 100)}%</div>
        </div>
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>
      <div className="p-4 divide-y divide-gray-50">
        {STEPS.map(({ key, label, href }) => {
          const isDone = onboarding[key];
          return (
            <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                {isDone
                  ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
                <span className={`text-sm font-medium ${isDone ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                  {label}
                </span>
              </div>
              {!isDone && href && (
                <Link href={href} className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                  Go <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
