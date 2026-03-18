import Link from 'next/link';
import {
  BarChart3, Layers, Users, Zap, ShieldCheck, Palette,
  ArrowRight, CheckCircle, ChevronRight, Star, TrendingUp,
  Target, Globe2, Sparkles,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Layers,
    title: 'Unified Taxonomy System',
    desc: 'Define your naming structure once and enforce it across Meta, Google Ads, TikTok, DV360, and LinkedIn — automatically.',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Cross-Channel Analytics',
    desc: 'A single dashboard showing ROAS, spend, impressions, and conversions across every platform your team runs.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Target,
    title: 'Audience Overlap Detection',
    desc: 'Automatically surface campaigns targeting the same audience and quantify the wasted budget before it drains your P&L.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Zap,
    title: '5-Step Campaign Wizard',
    desc: 'A guided creation flow with a live name-preview panel. Your team can launch compliant campaigns in minutes, not hours.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Users,
    title: 'Role-Based Team Access',
    desc: 'Admins, managers, and viewers — each with the right permissions. Invite your entire agency without losing control.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Palette,
    title: 'White-Label Ready',
    desc: 'Upload your agency logo, set brand colors, and deliver a fully branded experience to every client workspace.',
    color: 'bg-purple-100 text-purple-600',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Configure your taxonomy',
    desc: 'Define the naming hierarchy — brand, product, region, objective — that your agency uses across all campaigns.',
  },
  {
    num: '02',
    title: 'Launch campaigns the right way',
    desc: 'The guided wizard enforces your naming rules and generates the correct campaign name in real time.',
  },
  {
    num: '03',
    title: 'Analyze. Optimize. Report.',
    desc: 'Get unified cross-channel performance data, catch audience overlap, and produce client-ready exports in one click.',
  },
];

const PLATFORMS = ['Meta', 'Google Ads', 'TikTok', 'DV360', 'LinkedIn'];

const STATS = [
  { value: '5', label: 'Ad Platforms Supported', icon: Globe2 },
  { value: '100%', label: 'Naming Consistency', icon: ShieldCheck },
  { value: '3×', label: 'Faster Campaign Launch', icon: TrendingUp },
];

const TESTIMONIALS = [
  {
    quote: "Camparc cut our campaign naming errors to zero. The taxonomy wizard alone saved us hours every week across our client accounts.",
    name: 'Sarah Mitchell',
    role: 'Head of Paid Media, Apex Digital',
    initials: 'SM',
    color: 'bg-violet-200',
  },
  {
    quote: "The audience overlap detection surfaced $40K in wasted spend in the first week. This tool pays for itself every month.",
    name: 'Marcus Chen',
    role: 'Performance Director, Growth Labs',
    initials: 'MC',
    color: 'bg-blue-200',
  },
  {
    quote: "We white-labeled it for three of our biggest clients. They think we built it in-house. The branding customization is seamless.",
    name: 'Priya Nair',
    role: 'Co-Founder, Verve Media Group',
    initials: 'PN',
    color: 'bg-pink-200',
  },
];

const NAV_LINKS = ['Features', 'How It Works', 'Platforms', 'Pricing'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Camparc</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Sign In
            </Link>
            <Link href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg brand-gradient hover:opacity-90 transition-opacity shadow-sm">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7FF] via-white to-[#EDE9FE] -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-violet-200/40 to-transparent rounded-full -translate-y-32 translate-x-32 -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-blue-100/30 to-transparent rounded-full translate-y-24 -translate-x-24 -z-10" />

        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-violet-200">
              <Sparkles className="w-3.5 h-3.5" />
              Campaign Intelligence Platform for Marketing Agencies
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6">
              Stop Guessing.{' '}
              <span className="text-transparent bg-clip-text brand-gradient">
                Start Winning.
              </span>
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
              Standardize campaign naming across every platform, detect audience overlap before it wastes budget,
              and deliver cross-channel intelligence your clients will actually act on.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-200 text-base">
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-base">
                Sign In to Dashboard
              </Link>
            </div>

            {/* Platform trust bar */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                Supports campaigns on
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {PLATFORMS.map((p) => (
                  <span key={p}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 shadow-sm">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-violet-100/50 overflow-hidden">
              {/* Mock browser bar */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 max-w-xs mx-auto text-center">
                    app.camparc.io/dashboard
                  </div>
                </div>
              </div>
              {/* Mock dashboard UI */}
              <div className="flex" style={{ height: '380px' }}>
                {/* Sidebar mock */}
                <div className="w-48 bg-white border-r border-gray-100 p-4 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded brand-gradient" />
                    <span className="text-xs font-bold text-gray-900">Camparc</span>
                  </div>
                  {['Dashboard', 'Taxonomies', 'Campaigns', 'Analytics', 'Settings'].map((item, i) => (
                    <div key={item}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-xs font-medium ${
                        i === 0 ? 'brand-gradient text-white' : 'text-gray-500'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-300'}`} />
                      {item}
                    </div>
                  ))}
                </div>
                {/* Content mock */}
                <div className="flex-1 bg-[#F8F7FF] p-5 overflow-hidden">
                  {/* Welcome banner */}
                  <div className="brand-gradient rounded-xl p-5 mb-4 text-white">
                    <p className="text-xs font-semibold opacity-80 mb-1">CAMPAIGN INTELLIGENCE</p>
                    <p className="text-lg font-bold">Welcome back, Sarah 🔥</p>
                    <p className="text-xs opacity-70 mt-0.5">You have 3 campaigns awaiting review</p>
                  </div>
                  {/* KPI cards */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { l: 'Campaigns', v: '24', c: '#6C5CE7' },
                      { l: 'Active Budget', v: '$128K', c: '#00B894' },
                      { l: 'Total Spend', v: '$84K', c: '#0984e3' },
                      { l: 'Avg ROAS', v: '3.4×', c: '#e17055' },
                    ].map(({ l, v, c }) => (
                      <div key={l} className="bg-white rounded-xl p-3 border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">{l}</p>
                        <p className="text-base font-bold" style={{ color: c }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {/* Bars */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 mb-3">Performance by Platform</p>
                    <div className="space-y-2">
                      {[
                        { name: 'Meta', w: '72%', c: '#6C5CE7' },
                        { name: 'Google', w: '55%', c: '#A29BFE' },
                        { name: 'TikTok', w: '38%', c: '#74b9ff' },
                      ].map(({ name, w, c }) => (
                        <div key={name} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-12">{name}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: w, backgroundColor: c }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#6C5CE7] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-5xl font-extrabold tracking-tight">{value}</div>
                <div className="text-violet-200 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 text-xs font-semibold px-4 py-2 rounded-full mb-4 border border-violet-100">
              Everything you need
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Built for agencies. <br />
              <span className="text-transparent bg-clip-text brand-gradient">Loved by performance marketers.</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              Every feature is designed around how real marketing teams actually work — across platforms, clients, and campaigns.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50 transition-all group">
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-[#F8F7FF]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-4 py-2 rounded-full mb-4">
              How it works
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              From setup to insights in three steps.
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-violet-200 to-transparent z-0" />
                )}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative z-10">
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text brand-gradient mb-4 leading-none">
                    {num}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ── */}
      <section id="platforms" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 text-xs font-semibold px-4 py-2 rounded-full mb-4 border border-violet-100">
            Platform Support
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            One platform. Five channels.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-12">
            Camparc manages naming conventions, performance data, and audience overlap across all the major paid media platforms your clients run.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Meta', desc: 'Facebook & Instagram', color: 'bg-blue-50 border-blue-100 text-blue-700' },
              { name: 'Google Ads', desc: 'Search, Display & Video', color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
              { name: 'TikTok', desc: 'Short-form video', color: 'bg-pink-50 border-pink-100 text-pink-700' },
              { name: 'DV360', desc: 'Display & Video 360', color: 'bg-green-50 border-green-100 text-green-700' },
              { name: 'LinkedIn', desc: 'Professional network', color: 'bg-sky-50 border-sky-100 text-sky-700' },
            ].map(({ name, desc, color }) => (
              <div key={name} className={`rounded-2xl p-5 border ${color} text-left`}>
                <p className="font-bold text-base mb-1">{name}</p>
                <p className="text-xs opacity-70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-[#F8F7FF]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Trusted by performance marketing teams
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
              <div key={name} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="brand-gradient rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-12 translate-y-12" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Ready to get started?
              </div>
              <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
                Standardize your campaigns today.
              </h2>
              <p className="text-violet-200 mb-8 max-w-lg mx-auto">
                Set up your workspace in minutes. No credit card required. Invite your team and start naming campaigns the right way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-colors shadow-lg">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg">Camparc</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                The campaign naming and intelligence platform built for modern marketing agencies.
              </p>
            </div>
            {[
              {
                title: 'Product',
                links: ['Features', 'How It Works', 'Platforms', 'Changelog'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact'],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-white font-semibold text-sm mb-4">{title}</p>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Camparc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <a key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
