import { ArrowRight, Building2, Briefcase, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const USE_CASES = [
  {
    icon: Building2,
    tag: 'In-house marketers',
    headline: 'Stop rebuilding the same campaign twice.',
    pain: 'You plan the campaign in a doc or spreadsheet, then re-enter every field a second time in Meta Ads Manager — objective, budget, targeting, creative, all by hand.',
    solution: 'Build it once in Camparc and deploy it straight to Meta through the official API. It lands paused, exactly as planned, with nothing lost in translation.',
    color: `var(--color-primary)`,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Briefcase,
    tag: 'Digital agencies',
    headline: 'Keep naming consistent across every client.',
    pain: 'Every account manager has their own naming habits. When a client asks "why did performance drop?" you spend time reconciling data before you can even start the analysis.',
    solution: 'Set your taxonomy once and every campaign, for every client, follows the same structure — with a full audit trail of who deployed what, and white-label branding for how it looks to clients.',
    color: '#6c5ce7',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: BarChart2,
    tag: 'Marketing operations',
    headline: 'Get out of the manual-sync loop.',
    pain: "Checking Meta Ads Manager for fresh numbers, then copying them into your own reporting, is a recurring chore that eats into actual analysis time.",
    solution: 'Camparc pulls spend, impressions, clicks, and conversions back automatically every 6 hours, so the numbers in your dashboard are current without you doing anything.',
    color: '#00b894',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 bg-[#f8faff]">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-soft border border-blue-100 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Who It's For
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            If this sounds like your team,{' '}
            <span className="text-transparent bg-clip-text primary-gradient">you're in the right place.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {USE_CASES.map(({ icon: Icon, tag, headline, pain, solution, color, bg, border }) => (
            <Card key={tag} variant="outlined" padding="none" className={`${border} overflow-hidden`}>
              <div className={`${bg} px-6 py-5 border-b ${border}`}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                    <Icon className="w-4.5 h-4.5" style={{ color }} />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color }}>
                    {tag}
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-base leading-snug">{headline}</h3>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">The Pain</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{pain}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">How Camparc helps</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{solution}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            href="/register"
            variant="text"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="px-7 py-3.5 primary-gradient text-white hover:text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20/60 text-sm"
          >
            Get Started
          </Button>
        </div>

      </div>
    </section>
  );
}
