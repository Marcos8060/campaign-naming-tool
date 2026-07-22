import { Card } from '@/components/ui/Card';

const OBJECTIONS = [
  {
    q: '"We don\'t have time to implement another tool."',
    a: 'Connect your Meta ad account, set up a naming taxonomy, and deploy your first campaign in the same session. There\'s no implementation project — just a login.',
  },
  {
    q: '"The learning curve will slow down my team."',
    a: 'The campaign wizard is a form — fill in the fields, watch the name build itself, click deploy. If your team can use a spreadsheet, they can use Camparc.',
  },
  {
    q: '"I can\'t put client data in a third-party tool."',
    a: "Camparc runs on your own infrastructure via Docker Compose — it isn't a hosted third-party service holding your data. Ad account tokens are encrypted at rest.",
  },
  {
    q: '"Are we locked in if we stop using it?"',
    a: "Everything Camparc creates lives on Meta itself, under your own ad account — not inside Camparc. If you stop using it, your campaigns keep running exactly where they already are.",
  },
];

export function ObjectionsSection() {
  return (
    <section className="py-20 bg-landing-surface">
      <div className="max-w-4xl mx-auto px-6">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            FAQ
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            We&apos;ve heard the hesitation.
          </h2>
          <p className="text-gray-500 text-sm">Here are honest answers to what&apos;s holding you back.</p>
        </div>

        <div className="space-y-4">
          {OBJECTIONS.map(({ q, a }) => (
            <Card key={q} variant="outlined" padding="lg" className="shadow-sm">
              <p className="font-bold text-gray-900 mb-2 text-base leading-snug">{q}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
