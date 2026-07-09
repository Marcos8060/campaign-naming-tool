import { CheckCircle2, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';

type CellValue = string | boolean;

interface ComparisonRow {
  feature: string;
  camparc: CellValue;
  enterprise: CellValue;
  manual: CellValue;
}

const ROWS: ComparisonRow[] = [
  { feature: 'Setup time', camparc: '10 minutes', enterprise: '3–6 months', manual: 'Never done' },
  { feature: 'Monthly cost', camparc: 'From $49/mo', enterprise: '$2,000+/mo', manual: '$8K+ analyst salary' },
  { feature: 'Audience overlap detection', camparc: true, enterprise: true, manual: false },
  { feature: 'Cross-channel analytics', camparc: true, enterprise: true, manual: false },
  { feature: 'Automated naming enforcement', camparc: true, enterprise: false, manual: false },
  { feature: 'Agency multi-workspace', camparc: true, enterprise: false, manual: false },
  { feature: 'White-label branding', camparc: true, enterprise: false, manual: false },
  { feature: 'Self-host option', camparc: true, enterprise: false, manual: false },
  { feature: 'No vendor lock-in', camparc: true, enterprise: false, manual: true },
];

function Cell({ value }: { value: CellValue }) {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-gray-300 mx-auto" />
    );
  }
  return <span className="text-sm font-semibold text-gray-700">{value}</span>;
}

export function ComparisonSection() {
  return (
    <section id="compare" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-soft border border-blue-100 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Why Camparc
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            The smart middle ground.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Enterprise tools are overkill. Manual processes don't scale. Camparc gives you enterprise-grade operations at a price that makes sense for your business.
          </p>
        </div>

        {/* Table */}
        <Card variant="outlined" padding="none" className="overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 bg-gray-50 w-[35%]">
                  Comparison
                </th>
                <th className="px-6 py-4 text-center bg-primary/5 border-l border-r border-blue-100 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="primary-gradient text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                      Best Choice
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-primary">Camparc</span>
                </th>
                <th className="px-6 py-4 text-center bg-gray-50 text-sm font-semibold text-gray-500">
                  Enterprise Tools
                </th>
                <th className="px-6 py-4 text-center bg-gray-50 text-sm font-semibold text-gray-500">
                  Manual Process
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ROWS.map(({ feature, camparc, enterprise, manual }) => (
                <tr key={feature} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{feature}</td>
                  <td className="px-6 py-4 text-center bg-primary/[0.03] border-l border-r border-blue-100/50">
                    <Cell value={camparc} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Cell value={enterprise} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Cell value={manual} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-5">
          * Enterprise pricing estimates based on publicly available Maaten/CM360 pricing. Analyst salary based on $95K/yr average.
        </p>

      </div>
    </section>
  );
}
