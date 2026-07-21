import { Tag, Copy, History } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const PROBLEMS = [
  {
    icon: Tag,
    headline: 'Inconsistent naming',
    body: 'Fragmented data across teams. Different labels for the same thing makes cross-campaign reporting a nightmare.',
  },
  {
    icon: Copy,
    headline: 'Manual rebuilding',
    body: 'Copy-pasting from docs to Meta Ads Manager creates room for error and burns hours of expensive talent time.',
  },
  {
    icon: History,
    headline: 'Zero accountability',
    body: 'No record of who changed what inside the Meta UI. Shared logins mean zero visibility into the audit trail.',
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            The Problem
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Sound familiar? This is happening in{' '}
            <span className="text-transparent bg-clip-text primary-gradient">your campaigns right now.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PROBLEMS.map(({ icon: Icon, headline, body }) => (
            <Card key={headline} variant="outlined" padding="lg" className="flex flex-col">
              <Icon className="w-6 h-6 text-primary mb-4 flex-shrink-0" />
              <h3 className="text-lg font-extrabold text-gray-900 mb-3 leading-snug">{headline}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{body}</p>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
