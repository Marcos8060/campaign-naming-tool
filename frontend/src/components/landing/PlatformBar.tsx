import { Badge } from '@/components/ui/Badge';

const PLATFORMS = [
  { name: 'Meta', color: 'border-blue-200 text-primary bg-blue-50' },
  { name: 'Google Ads', color: 'border-yellow-200 text-yellow-700 bg-yellow-50' },
  { name: 'TikTok', color: 'border-pink-200 text-pink-700 bg-pink-50' },
  { name: 'DV360', color: 'border-positive/20 text-positive bg-positive-soft' },
  { name: 'LinkedIn', color: 'border-sky-200 text-sky-700 bg-sky-50' },
];

export function PlatformBar() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            Supported platforms
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PLATFORMS.map(({ name, color }) => (
              <Badge
                key={name}
                className={`px-3.5 py-1.5 text-xs font-bold border ${color}`}
              >
                {name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
