import { Fragment } from 'react';
import { Workflow, Rocket, ArrowLeftRight, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: Workflow,
    title: 'Name',
    body: 'Define your naming taxonomy once. Enforce it across every person and campaign.',
  },
  {
    num: '02',
    icon: Rocket,
    title: 'Deploy',
    body: 'Push live to Meta directly via API. Everything lands paused, ready for your final manual review.',
  },
  {
    num: '03',
    icon: ArrowLeftRight,
    title: 'Sync',
    body: 'Performance data flows back automatically every few hours, keeping your reporting clean.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-landing-surface">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-soft border border-blue-100 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            How It Works
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
            One loop. Name, deploy, sync — and it keeps going.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-x-4 gap-y-10 items-start">
          {STEPS.map(({ num, icon: Icon, title, body }, i) => (
            <Fragment key={num}>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-extrabold text-gray-300 tracking-tight">{num}</span>
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[220px]">{body}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex items-center justify-center pt-6">
                  <ArrowRight className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </Fragment>
          ))}
        </div>

      </div>
    </section>
  );
}
