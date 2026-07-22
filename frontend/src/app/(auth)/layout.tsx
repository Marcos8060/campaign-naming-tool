export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 primary-gradient flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-16 translate-y-16" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-full flex-shrink-0 shadow-sm" />
          <span className="text-white font-extrabold text-2xl tracking-tight">Camparc</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-extrabold text-white leading-[1.08] mb-5">
            Campaign naming.<br />Finally standardized.
          </h2>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm">
            Define your taxonomy once. Enforce it across Meta, Google Ads, TikTok, DV360, and LinkedIn.
          </p>
          <div className="flex gap-10 mt-10">
            {[['5', 'Platforms'], ['100%', 'Consistency'], ['3x', 'Faster Launch']].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-white">{val}</p>
                <p className="text-blue-200 text-xs font-bold mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-200 text-xs">
          © {new Date().getFullYear()} Camparc · Campaign Intelligence Platform
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 bg-surface-fixed">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-full primary-gradient flex-shrink-0" />
            <span className="font-extrabold text-t1-fixed text-xl">Camparc</span>
          </div>

          <div className="rounded-2xl shadow-xl p-8 md:p-10 border border-bd-fixed bg-card-fixed">
            {children}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6">
            <a href="/security" className="text-xs font-medium text-t3-fixed hover:text-t2-fixed transition-colors">
              Security Policy
            </a>
            <a href="/contact" className="text-xs font-medium text-t3-fixed hover:text-t2-fixed transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
