import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Perfect for solo marketers and small teams getting started.',
    features: [
      '1 workspace',
      '3 team members',
      '25 campaigns/month',
      'Basic analytics dashboard',
      'All 5 ad platforms',
      'Campaign naming wizard',
    ],
    cta: 'Get Started Free',
    ctaHref: '/register',
    highlight: false,
  },
  {
    name: 'Agency',
    price: '$49',
    period: '/month',
    desc: 'For growing agencies managing multiple campaigns and clients.',
    features: [
      'Unlimited campaigns',
      '15 team members',
      'All 5 ad platforms',
      'Audience overlap detection',
      'Cross-channel analytics',
      'Client-ready CSV exports',
      'White-label branding',
      'Role-based access (Admin/Manager/Viewer)',
    ],
    cta: 'Start Free Trial',
    ctaHref: '/register',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large organizations and agencies with complex requirements.',
    features: [
      'Unlimited workspaces',
      'Unlimited team members',
      'SSO & advanced RBAC',
      'Self-host deployment',
      'Dedicated account manager',
      'Custom integrations & API',
      'SLA & priority support',
      'Custom data retention',
    ],
    cta: 'Contact Sales',
    ctaHref: '/register',
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-soft border border-blue-100 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Simple Pricing
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Start free. Pay when you grow.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Full access from day one. No credit card required, no hidden fees, no lock-in contracts. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(({ name, price, period, desc, features, cta, ctaHref, highlight, badge }) => (
            <Card
              key={name}
              variant="outlined"
              padding="lg"
              className={`relative flex flex-col ${
                highlight
                  ? 'border-[var(--color-primary)] shadow-xl shadow-primary/10'
                  : 'hover:border-gray-300 transition-colors'
              }`}
            >
              {badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="primary-gradient text-white text-[10px] font-extrabold px-3.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                    {badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className="text-sm font-bold text-gray-500 mb-1">{name}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{price}</span>
                  {period && <span className="text-gray-400 text-sm font-medium mb-1.5">{period}</span>}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        highlight ? 'text-primary' : 'text-gray-400'
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                href={ctaHref}
                variant="text"
                icon={highlight ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
                iconPosition="right"
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  highlight
                    ? 'primary-gradient text-white hover:text-white hover:opacity-90 shadow-md shadow-primary/20/50'
                    : 'border border-gray-200 text-gray-700 hover:border-[var(--color-primary)] hover:text-primary hover:bg-primary-soft/50'
                }`}
              >
                {cta}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All plans include a{' '}
            <span className="font-semibold text-gray-700">14-day free trial</span>.
            {' '}No credit card required.{' '}
            <span className="font-semibold text-gray-700">Cancel anytime.</span>
            {' '}Your data exports in full if you leave.
          </p>
        </div>

      </div>
    </section>
  );
}
