import {
  SlidersHorizontal, Send, CircleDollarSign, History, ShieldCheck, Palette,
} from 'lucide-react';

const FEATURES = [
  {
    icon: SlidersHorizontal,
    title: 'Naming Enforcement',
    body: 'Enforce consistency across your team. No more rogue naming conventions in your account.',
  },
  {
    icon: Send,
    title: 'One-click Meta Deploy',
    body: 'Deploy campaigns, ad sets, and ads directly from your taxonomy. Fast and error-free.',
  },
  {
    icon: CircleDollarSign,
    title: 'Currency-aware Budgets',
    body: "Never mislabel again. Budgets are labeled in your ad account's real currency, not just USD.",
  },
  {
    icon: History,
    title: 'Automatic Sync',
    body: 'Performance that syncs itself. We pull data automatically, available any time you need it.',
  },
  {
    icon: ShieldCheck,
    title: 'Full Audit Trail',
    body: 'Every creation, deployment, and deletion is logged against the person who did it. No mystery changes.',
  },
  {
    icon: Palette,
    title: 'White-label Branding',
    body: 'Set your logo and brand colors. Deliver a workspace styled for your agency to every client.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-navy-dark">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Features
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Everything from planning to{' '}
            <span className="text-blue-400">real numbers.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="font-bold text-white mb-2 text-base leading-snug">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
