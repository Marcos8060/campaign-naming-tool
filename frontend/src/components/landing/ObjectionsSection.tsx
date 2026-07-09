import { Clock, BookOpen, Lock, Globe2, Package } from 'lucide-react';

const OBJECTIONS = [
  {
    icon: Clock,
    q: '"We don\'t have time to implement another tool."',
    a: 'Setup takes 10 minutes. Seriously. Create your workspace, define your taxonomy, invite your team. First campaign can go live in your first session. There\'s no implementation project — just a login.',
    color: `var(--color-primary)`,
  },
  {
    icon: BookOpen,
    q: '"The learning curve will slow down my team."',
    a: 'If your team can use Google Sheets, they can use Camparc. The campaign wizard is literally a form — fill in the boxes, see the name, click create. Onboarding takes 15 minutes per person.',
    color: '#6c5ce7',
  },
  {
    icon: Lock,
    q: '"I can\'t put client data in a third-party tool."',
    a: "All data is encrypted at rest and in transit. If compliance is mission-critical, deploy Camparc on your own infrastructure. You own your data completely — always.",
    color: '#e17055',
  },
  {
    icon: Globe2,
    q: '"We only use two platforms. Is it worth it?"',
    a: 'Even with two platforms, audience overlap between Meta and Google alone can waste 20–30% of your budget. Most teams recoup the annual subscription cost in the first two weeks.',
    color: '#00b894',
  },
  {
    icon: Package,
    q: '"What happens to our data if we cancel?"',
    a: "You export everything — campaigns, taxonomy trees, analytics history — as CSVs before you go. No data hostage situations. No vendor lock-in. Your team's work stays yours.",
    color: '#fdcb6e',
  },
];

export function ObjectionsSection() {
  return (
    <section className="py-20 bg-[#f8faff]">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Common Questions
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            We've heard the hesitation.
          </h2>
          <p className="text-gray-500 text-sm">Here are the real answers to what's holding you back.</p>
        </div>

        {/* Q&A */}
        <div className="space-y-4">
          {OBJECTIONS.map(({ icon: Icon, q, a, color }) => (
            <div key={q} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: color + '15' }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-2 text-sm leading-snug">{q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
