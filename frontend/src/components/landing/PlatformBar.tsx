import { Badge } from '@/components/ui/Badge';

const EXPORT_PLATFORMS = ['Google Ads', 'TikTok', 'DV360', 'LinkedIn'];

export function PlatformBar() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Live on
            </p>
            <Badge className="px-3.5 py-1.5 text-xs font-bold border border-blue-200 text-primary bg-blue-50">
              Meta
            </Badge>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-200" />
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Naming &amp; export-ready for
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXPORT_PLATFORMS.map((name) => (
                <Badge key={name} className="px-3.5 py-1.5 text-xs font-bold border border-gray-200 text-gray-600 bg-white">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
