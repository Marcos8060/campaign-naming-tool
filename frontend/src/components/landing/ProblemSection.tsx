import { Clock, DollarSign, AlertOctagon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const PROBLEMS = [
  {
    icon: DollarSign,
    stat: '$353B',
    statLabel: 'in global ad spend every year',
    headline: 'Your audiences overlap. Your platforms won\'t tell you.',
    body: 'Meta doesn\'t know about your Google Ads campaign. Google doesn\'t know about TikTok. Your team ends up bidding against itself — paying twice to reach the same person. The platforms profit. You don\'t.',
    accent: '#e17055',
    bg: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  {
    icon: Clock,
    stat: '80%',
    statLabel: 'of analyst time wasted on cleanup',
    headline: 'Your naming conventions are different every time.',
    body: '"META_Q4_Brand", "Meta-Brand-Q4", "meta brand campaign Q4 2024" — all from the same team, same quarter. Every inconsistency costs hours to reconcile before you can even begin to analyze performance.',
    accent: '#f59e0b',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  {
    icon: AlertOctagon,
    stat: '35%',
    statLabel: 'of ad spend lost to duplicate targeting',
    headline: 'Budget decisions are guesswork, not data.',
    body: 'You can\'t reallocate budget intelligently when your data is siloed across five platforms with five different naming schemes. Attribution is impossible. Optimization is based on gut feel. And the waste compounds every single day.',
    accent: '#6c5ce7',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            The Problem
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Sound familiar? This is happening in{' '}
            <span className="text-transparent bg-clip-text primary-gradient">your campaigns right now.</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            The marketing industry wastes over $353 billion annually on inefficiency. Most of it is silent — you never see the waste, you just feel it in your ROAS.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PROBLEMS.map(({ icon: Icon, stat, statLabel, headline, body, bg, border, iconBg, iconColor }) => (
            <Card
              key={headline}
              variant="outlined"
              padding="lg"
              className={`${bg} ${border} flex flex-col`}
            >
              <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-5 flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>

              <div className="mb-4">
                <p className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">{stat}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">{statLabel}</p>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug">{headline}</h3>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{body}</p>
            </Card>
          ))}
        </div>

        {/* Callout */}
        <Card variant="outlined" padding="lg" className="mt-10 bg-gray-900 border-none text-center">
          <p className="text-white text-lg font-bold mb-1.5">
            If you spend $500K/month on ads, you're likely wasting{' '}
            <span className="text-[#ff7675] font-extrabold">$175,000</span>{' '}
            on duplicate audiences alone.
          </p>
          <p className="text-gray-400 text-sm">
            That's not a rounding error — that's a full-time hire or three months of creative production.
          </p>
        </Card>

      </div>
    </section>
  );
}
