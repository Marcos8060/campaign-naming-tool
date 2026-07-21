import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FinalCTASection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative primary-gradient rounded-3xl p-12 md:p-16 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-32 -translate-y-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-16 translate-y-16 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.1] mb-5 max-w-3xl">
              Name your next campaign properly.
            </h2>

            <p className="text-white/75 text-base leading-relaxed max-w-xl mb-10">
              Connect a Meta ad account and deploy your first campaign in minutes — paused,
              transparent, and yours to activate whenever you&apos;re ready.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                href="/register"
                variant="text"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="px-8 py-4 bg-white text-primary hover:text-primary font-extrabold rounded-xl hover:bg-blue-50 transition-colors shadow-xl text-sm"
              >
                Get Started
              </Button>
              <Button
                href="/login"
                variant="text"
                className="px-8 py-4 bg-white/15 text-white hover:text-white font-semibold rounded-xl border border-white/25 hover:bg-white/20 transition-colors text-sm"
              >
                Already have an account? Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
