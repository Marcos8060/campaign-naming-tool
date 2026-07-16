import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] primary-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-16 translate-y-16" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">Camparc</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Campaign naming.<br />Finally<br />standardized.
          </h2>
          <p className="text-blue-100 text-base leading-relaxed max-w-xs">
            Define your taxonomy once. Enforce it across Meta, Google Ads, TikTok, DV360, and LinkedIn.
          </p>
          <div className="flex gap-8 mt-10">
            {[['5', 'Platforms'], ['100%', 'Consistency'], ['3×', 'Faster Launch']].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-white">{val}</p>
                <p className="text-blue-200 text-xs font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-200 text-xs">
          © {new Date().getFullYear()} Camparc · Campaign Intelligence Platform
        </p>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-6 md:p-8"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-t1 text-xl">Camparc</span>
          </div>

          <div
            className="rounded-2xl shadow-xl p-6 md:p-8 border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
