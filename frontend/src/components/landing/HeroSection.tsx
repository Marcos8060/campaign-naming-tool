import { ArrowRight, CheckCircle2, AlertTriangle, TrendingDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const TRUST_BADGES = [
  '14-day free trial',
  'No credit card required',
  'Setup in 10 minutes',
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(46,107,228,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_100%_100%,rgba(108,92,231,0.04),transparent)]" />

      <div className="max-w-7xl mx-auto px-6 pt-14 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-soft border border-blue-100 px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Campaign Intelligence Platform
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Your team is wasting{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text primary-gradient">35% of ad spend</span>
              </span>
              {' '}right now.
            </h1>

            <p className="text-base text-gray-500 leading-relaxed max-w-[520px] mb-8">
              Duplicate audiences, inconsistent campaign naming, and hours of manual cleanup are silently draining your budget. Camparc detects the waste, standardizes your operations, and gives you back control — across every ad platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <Button
                href="/register"
                variant="text"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="px-7 py-3.5 primary-gradient text-white hover:text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20/60 text-sm"
              >
                Find My Wasted Spend
              </Button>
              <Button
                href="/login"
                variant="text"
                className="px-7 py-3.5 bg-white text-gray-700 hover:text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-primary-soft/50 transition-all text-sm"
              >
                Sign In to Dashboard
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {TRUST_BADGES.map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/10 blur-3xl rounded-3xl scale-95 pointer-events-none" />

              <Card variant="elevated" padding="none" className="relative border border-gray-200/80 shadow-2xl shadow-blue-100/50 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[10px] text-gray-400 w-52 mx-auto text-center font-mono">
                      app.camparc.io/dashboard
                    </div>
                  </div>
                </div>

                <div className="flex" style={{ height: 380 }}>
                  <div className="w-44 bg-white border-r border-gray-100 px-3 pt-4 pb-3 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-6 px-1">
                      <div className="w-6 h-6 rounded-lg primary-gradient flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-extrabold text-gray-900">Camparc</span>
                    </div>
                    {['Dashboard', 'Campaigns', 'Analytics', 'Taxonomies', 'Settings'].map((item, i) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-medium mb-0.5 ${
                          i === 0 ? 'primary-gradient text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-white/70' : 'bg-gray-200'}`} />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 bg-[#f5f8ff] p-3.5 overflow-hidden space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-red-700">Audience Overlap Detected</p>
                        <p className="text-[9px] text-red-500 mt-0.5">Meta + Google Ads targeting same 240K users</p>
                        <p className="text-[10px] font-extrabold text-red-800 mt-1">$42,180 in duplicate spend this month</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { l: 'Active', v: '24', c: `var(--color-primary)` },
                        { l: 'Budget', v: '$128K', c: '#00b894' },
                        { l: 'ROAS', v: '3.4×', c: '#6c5ce7' },
                      ].map(({ l, v, c }) => (
                        <div key={l} className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm">
                          <p className="text-[8px] text-gray-400 mb-0.5 font-medium">{l}</p>
                          <p className="text-sm font-extrabold" style={{ color: c }}>{v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">Live Name Preview</p>
                        <span className="text-[8px] bg-emerald-50 text-emerald-600 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-100">Valid</span>
                      </div>
                      <div className="font-mono text-[9px] text-gray-800 bg-primary-soft rounded-lg px-2.5 py-2 break-all leading-relaxed border border-blue-100">
                        META_23Q4_APEX_BRAND_US_CONV_PROSPECTING
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <p className="text-[9px] font-bold text-gray-500 mb-2 uppercase tracking-wide">Spend by Platform</p>
                      <div className="space-y-2">
                        {[
                          { n: 'Meta', w: '68%', c: `var(--color-primary)` },
                          { n: 'Google', w: '45%', c: '#6c5ce7' },
                          { n: 'TikTok', w: '27%', c: '#fd79a8' },
                        ].map(({ n, w, c }) => (
                          <div key={n} className="flex items-center gap-2">
                            <span className="text-[8px] text-gray-400 w-9 font-medium">{n}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width: w, backgroundColor: c }} />
                            </div>
                            <span className="text-[8px] text-gray-500 font-semibold">{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="none" className="absolute -bottom-3 -left-4 border border-gray-200 px-4 py-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-gray-900">$42K saved</p>
                  <p className="text-[9px] text-gray-400">overlap removed this month</p>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
