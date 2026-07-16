import { ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const PROMISES = [
  'Detect audience overlap in your first session',
  'Standardize naming across every platform',
  'Cut reporting time by 80%',
  'No credit card. No sales call.',
];

export function FinalCTASection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative primary-gradient rounded-3xl p-12 md:p-16 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-32 -translate-y-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-16 translate-y-16 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <TrendingDown className="w-7 h-7 text-white" />
            </div>

            <div className="inline-block bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              The cost of waiting
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.1] mb-5 max-w-3xl">
              Every day you wait, you're burning{' '}
              <span className="text-yellow-300">$1,400</span> on duplicate audiences.
            </h2>

            <p className="text-white/75 text-base leading-relaxed max-w-xl mb-8">
              That's $42K per month — gone. Audience overlap doesn't fix itself. It compounds. Start your free trial today, and you could find that waste before your next billing cycle.
            </p>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10">
              {PROMISES.map((p) => (
                <div key={p} className="flex items-center gap-2 text-sm text-white/85 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                href="/register"
                variant="text"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="px-8 py-4 bg-white text-primary hover:text-primary font-extrabold rounded-xl hover:bg-blue-50 transition-colors shadow-xl text-sm"
              >
                Find My Wasted Spend Now
              </Button>
              <Button
                href="/login"
                variant="text"
                className="px-8 py-4 bg-white/15 text-white hover:text-white font-semibold rounded-xl border border-white/25 hover:bg-white/20 transition-colors text-sm"
              >
                Already have an account? Sign In
              </Button>
            </div>

            <p className="mt-5 text-xs text-white/50">
              Free 14-day trial · No credit card · Setup in 10 minutes · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
