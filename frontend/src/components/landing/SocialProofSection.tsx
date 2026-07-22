import { Lock, Terminal, Server } from 'lucide-react';

const PROOF_POINTS = [
  {
    icon: Lock,
    title: 'No autonomous spending',
    body: 'Camparc only acts when you explicitly click. No black-box algorithms spending your budget.',
  },
  {
    icon: Terminal,
    title: 'Real Meta error messages',
    body: 'See the exact reason a campaign failed to deploy directly from the Meta API, not a generic "error."',
  },
  {
    icon: Server,
    title: 'Self-hostable Infrastructure',
    body: 'Deploy via Docker Compose on your own on-prem or cloud infrastructure. Your data stays yours.',
  },
];

function CodeLine({ children }: { children: React.ReactNode }) {
  return <div className="whitespace-pre">{children}</div>;
}

export function SocialProofSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Nothing here is a mockup.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
              Camparc is built and tested end-to-end against real Meta ad accounts — not a demo
              environment with placeholder data.
            </p>

            <div className="space-y-6">
              {PROOF_POINTS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-navy-dark rounded-2xl p-7 shadow-2xl shadow-blue-100/50 overflow-x-auto">
            <pre className="font-mono text-[12.5px] leading-relaxed">
              <CodeLine><span className="text-emerald-400"># Docker Compose configuration</span></CodeLine>
              <CodeLine><span className="text-gray-400">version:</span> <span className="text-blue-300">&apos;3.8&apos;</span></CodeLine>
              <CodeLine><span className="text-gray-400">services:</span></CodeLine>
              <CodeLine>  <span className="text-gray-200">camparc-api:</span></CodeLine>
              <CodeLine>    <span className="text-gray-400">image:</span> <span className="text-blue-300">camparc/core:latest</span></CodeLine>
              <CodeLine>    <span className="text-gray-400">environment:</span></CodeLine>
              <CodeLine>      - <span className="text-blue-300">DATABASE_URL=${'{'}DATABASE_URL{'}'}</span></CodeLine>
              <CodeLine>      - <span className="text-blue-300">META_APP_ID=${'{'}META_APP_ID{'}'}</span></CodeLine>
              <CodeLine>      - <span className="text-blue-300">ENCRYPTION_KEY=${'{'}ENCRYPTION_KEY{'}'}</span></CodeLine>
              <CodeLine>    <span className="text-gray-400">networks:</span></CodeLine>
              <CodeLine>      - <span className="text-blue-300">marketing-stack</span></CodeLine>
              <CodeLine>&nbsp;</CodeLine>
              <CodeLine>  <span className="text-gray-500">camparc-ui:</span></CodeLine>
              <CodeLine>    <span className="text-gray-500">image: camparc/frontend:latest</span></CodeLine>
              <CodeLine>    <span className="text-gray-500">ports:</span></CodeLine>
              <CodeLine>      <span className="text-gray-500">- &quot;8080:80&quot;</span></CodeLine>
              <CodeLine>    <span className="text-gray-500">depends_on:</span></CodeLine>
              <CodeLine>      <span className="text-gray-500">- camparc-api</span></CodeLine>
            </pre>
          </div>

        </div>
      </div>
    </section>
  );
}
