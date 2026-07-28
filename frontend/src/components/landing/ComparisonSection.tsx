import { CheckCircle2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

type CellValue = string | boolean | 'warning' | 'blue-check';

interface ComparisonRow {
  feature: string;
  camparc: CellValue;
  manual: CellValue;
}

const ROWS: ComparisonRow[] = [
  { feature: 'Enforced naming taxonomy', camparc: true, manual: false },
  { feature: 'One-click deploy to Meta', camparc: true, manual: false },
  { feature: 'Everything starts paused', camparc: true, manual: 'Depends on user' },
  { feature: 'Real error messages', camparc: true, manual: 'Yes' },
  { feature: 'Full audit trail', camparc: true, manual: false },
  { feature: 'Self-hostable (Docker)', camparc: true, manual: false },
];

function Cell({ value }: { value: CellValue }) {
  if (value === true) return <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-5 h-5 text-gray-300 mx-auto" />;
  if (value === 'warning') return <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />;
  if (value === 'blue-check') return <CheckCircle className="w-5 h-5 text-primary mx-auto fill-primary-soft" />;
  return <span className="text-xs font-medium text-gray-600">{value}</span>;
}

export function ComparisonSection() {
  return (
    <section id="compare" className="py-20 bg-landing-surface">
      <div className="max-w-5xl mx-auto px-6">

        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Transparent by design.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            How we stack up against doing it by hand.
          </p>
        </div>

        <p className="sm:hidden text-center text-xs text-gray-400 mb-2">
          Swipe to see all columns →
        </p>

        <Card variant="outlined" padding="none" className="overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="sticky left-0 z-10 text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-500 bg-gray-50 w-[34%] sm:w-[40%]">
                    Features
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center bg-primary/5 border-l border-r border-blue-100">
                    <span className="text-xs sm:text-sm font-extrabold text-primary">Camparc</span>
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center bg-gray-50 text-xs sm:text-sm font-semibold text-gray-500 whitespace-nowrap">
                    Manual (Meta UI)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ROWS.map(({ feature, camparc, manual }) => (
                  <tr key={feature} className="hover:bg-gray-50/50 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 font-medium">{feature}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center bg-primary/[0.03] border-l border-r border-blue-100/50">
                      <Cell value={camparc} />
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <Cell value={manual} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-5 italic">
          This is Camparc&apos;s own honest read of the tradeoffs, not an independent audit of any
          specific product.
        </p>

      </div>
    </section>
  );
}
