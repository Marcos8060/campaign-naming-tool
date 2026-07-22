import { ArrowRight, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const TRUST_BADGES = [
  "Deploys through Meta's official API",
  'Every campaign starts paused',
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(46,107,228,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_100%_100%,rgba(108,92,231,0.04),transparent)]" />

      <div className="max-w-7xl mx-auto px-6 pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-soft border border-blue-100 px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              Campaign naming &amp; deployment for Meta
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Standardize naming. Deploy directly. Sync performance.
            </h1>

            <p className="text-base text-gray-500 leading-relaxed max-w-[520px] mb-8">
              The B2B SaaS tool for in-house teams and agencies to manage Meta campaigns with
              absolute naming consistency and automated data loops.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <Button
                href="/register"
                variant="text"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="px-7 py-3.5 primary-gradient text-white hover:text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20/60 text-sm"
              >
                Get Started
              </Button>
              <Button
                href="/login"
                variant="text"
                className="px-7 py-3.5 bg-white text-gray-700 hover:text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-primary-soft/50 transition-all text-sm"
              >
                Sign In to Dashboard
              </Button>
            </div>

            <div className="flex flex-col gap-2.5">
              {TRUST_BADGES.map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/10 blur-3xl rounded-3xl scale-95 pointer-events-none" />

              <Card variant="elevated" padding="none" className="relative border border-gray-200/80 shadow-2xl shadow-blue-100/50 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3.5 flex items-center gap-3">
                  <div className="flex gap-1.5 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-end">
                    <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[10px] text-gray-400 font-mono">
                      app.camparc.io/campaigns
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3.5 bg-[#f5f8ff]">
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Live Name Preview</p>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full border border-emerald-100">Valid</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-primary bg-primary-soft rounded-lg px-3 py-2.5 break-all border border-blue-100">
                      NIKE_UB_NA_BF24
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Meta Deployment</p>
                      <p className="text-xs text-gray-400">Created paused — ready when you are</p>
                    </div>
                    <span className="text-[10px] bg-primary-soft text-primary font-bold px-2 py-1 rounded-full flex-shrink-0">Deployed</span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-2">
                      <RefreshCw className="w-3.5 h-3.5 text-primary" />
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wide">Performance Sync</p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Spend, impressions, clicks, and conversions pulled from Meta automatically every 6 hours.
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="none" className="animate-float absolute -bottom-10 -left-5 border border-gray-200 px-4 py-3 flex items-center gap-3 max-w-[240px]">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-900">Every action logged</p>
                  <p className="text-[11px] text-gray-400">who deployed what, and when</p>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
