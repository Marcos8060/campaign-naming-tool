import Link from 'next/link';
import {
  BarChart3, Layers, Users, Zap, ShieldCheck, Palette,
  ArrowRight, Star, TrendingUp, Target, Globe2, Sparkles,
  CheckCircle2, ChevronRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Layers,
    title: 'Unified Taxonomy System',
    desc: 'Define your naming structure once. Enforce it automatically across Meta, Google Ads, TikTok, DV360, and LinkedIn.',
    color: 'bg-blue-100 text-[#2e6be4]',
  },
  {
    icon: BarChart3,
    title: 'Cross-Channel Analytics',
    desc: 'One dashboard. ROAS, spend, impressions, and conversions across every platform — no spreadsheet stitching.',
    color: 'bg-sky-100 text-sky-600',
  },
  {
    icon: Target,
    title: 'Audience Overlap Detection',
    desc: 'Surface campaigns targeting the same audience. Quantify the wasted budget before it drains your P&L.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Zap,
    title: '5-Step Campaign Wizard',
    desc: 'A guided creation flow with a live name-preview panel. Launch compliant campaigns in minutes, not hours.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Users,
    title: 'Role-Based Team Access',
    desc: 'Admins, managers, and viewers — each with the right permissions. Scale your agency without losing control.',
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
    badge: 'Setup',
  },
  {
    num: '02',
    title: 'Launch campaigns the right way',
    desc: 'The guided wizard enforces your naming rules and generates the correct campaign name in real time.',
    badge: 'Execution',
  },
  {
    num: '03',
    title: 'Analyze. Optimize. Report.',
    desc: 'Unified cross-channel performance data, audience overlap detection, and client-ready exports in one click.',
    badge: 'Intelligence',
  },
];

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
  },
  {
    quote: "The audience overlap detection surfaced $40K in wasted spend in the first week. This tool pays for itself every single month.",
    name: 'Marcus Chen',
    role: 'Performance Director, Growth Labs',
    initials: 'MC',
  },
  {
    quote: "We white-labeled it for three of our biggest clients. They think we built it in-house. The branding customization is seamless.",
    name: 'Priya Nair',
    role: 'Co-Founder, Verve Media Group',
    initials: 'PN',
  },
];

const PLATFORMS = [
  { name: 'Meta', color: 'border-blue-200 text-blue-700 bg-blue-50' },
  { name: 'Google Ads', color: 'border-yellow-200 text-yellow-700 bg-yellow-50' },
  { name: 'TikTok', color: 'border-pink-200 text-pink-700 bg-pink-50' },
  { name: 'DV360', color: 'border-green-200 text-green-700 bg-green-50' },
  { name: 'LinkedIn', color: 'border-sky-200 text-sky-700 bg-sky-50' },
];

const TRUST_ITEMS = [
  'No credit card required',
  'Setup in under 5 minutes',
  'Cancel anytime',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#ffffff' }}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">Camparc</span>
          </div>

          <div className="hidden md:flex items-center gap-7">
            {['Features', 'How It Works', 'Platforms', 'Pricing'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Sign In
            </Link>
            <Link href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg brand-gradient hover:opacity-90 transition-opacity shadow-sm">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle blue tint background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_0%,rgba(46,107,228,0.07),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_0%_100%,rgba(91,142,240,0.05),transparent)]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#2e6be4 1px,transparent 1px),linear-gradient(90deg,#2e6be4 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-6 py-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2e6be4] text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-blue-100">
                <Sparkles className="w-3 h-3" />
                Campaign Intelligence Platform
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-[3.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
                Stop naming campaigns{' '}
                <span className="text-transparent bg-clip-text brand-gradient">
                  the wrong way.
                </span>
              </h1>

              <p className="text-[15px] text-gray-500 leading-relaxed max-w-lg mb-7">
                Standardize campaign naming across every ad platform, detect audience overlap before it wastes budget,
                and deliver cross-channel intelligence your clients will actually act on.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-blue-200 text-sm">
                  Start Free — No Card Needed <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-[#2e6be4]/40 hover:bg-blue-50 transition-all text-sm">
                  Sign In to Dashboard
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_ITEMS.map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2e6be4]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dashboard mock */}
            <div className="hidden lg:flex justify-end">
              <div className="w-full max-w-[520px] bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-blue-100/60 overflow-hidden">
                {/* Browser bar */}
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[10px] text-gray-400 max-w-[200px] mx-auto text-center">
                      app.camparc.io/dashboard
                    </div>
                  </div>
                </div>
                {/* Mock UI */}
                <div className="flex" style={{ height: '340px' }}>
                  {/* Sidebar */}
                  <div className="w-40 bg-white border-r border-gray-100 p-3 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-6 h-6 rounded brand-gradient flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-900">Camparc</span>
                    </div>
                    {[
                      { label: 'Dashboard', active: true },
                      { label: 'Campaigns', active: false },
                      { label: 'Analytics', active: false },
                      { label: 'Taxonomies', active: false },
                      { label: 'Settings', active: false },
                    ].map(({ label, active }) => (
                      <div key={label}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-0.5 text-[11px] font-medium ${
                          active ? 'brand-gradient text-white' : 'text-gray-400'
                        }`}>
                        <div className={`w-1 h-1 rounded-full flex-shrink-0 ${active ? 'bg-white' : 'bg-gray-300'}`} />
                        {label}
                      </div>
                    ))}
                  </div>
                  {/* Content */}
                  <div className="flex-1 bg-[#f5f8ff] p-3.5 overflow-hidden">
                    {/* Welcome banner */}
                    <div className="brand-gradient rounded-xl p-3.5 mb-3 text-white">
                      <p className="text-[9px] font-semibold opacity-70 mb-0.5 uppercase tracking-wider">Campaign Intelligence</p>
                      <p className="text-sm font-bold">Good morning, Sarah 🔥</p>
                      <p className="text-[9px] opacity-60 mt-0.5">3 campaigns pending review</p>
                    </div>
                    {/* KPI row */}
                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                      {[
                        { l: 'Campaigns', v: '24', c: '#2e6be4' },
                        { l: 'Budget', v: '$128K', c: '#10b981' },
                        { l: 'Spend', v: '$84K', c: '#5b8ef0' },
                        { l: 'ROAS', v: '3.4×', c: '#f59e0b' },
                      ].map(({ l, v, c }) => (
                        <div key={l} className="bg-white rounded-lg p-2 border border-gray-100">
                          <p className="text-[8px] text-gray-400 mb-0.5">{l}</p>
                          <p className="text-xs font-bold" style={{ color: c }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    {/* Bar chart mock */}
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-[9px] font-semibold text-gray-500 mb-2">Performance by Platform</p>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Meta', w: '72%', c: '#2e6be4' },
                          { name: 'Google', w: '55%', c: '#5b8ef0' },
                          { name: 'TikTok', w: '38%', c: '#93c5fd' },
                        ].map(({ name, w, c }) => (
                          <div key={name} className="flex items-center gap-2">
                            <span className="text-[8px] text-gray-400 w-9">{name}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width: w, backgroundColor: c }} />
                            </div>
                            <span className="text-[8px] font-semibold text-gray-500">{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PLATFORM TRUST BAR ── */}
      <section className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest whitespace-nowrap">
              Supports campaigns on
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PLATFORMS.map(({ name, color }) => (
                <span key={name}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ backgroundColor: '#2e6be4' }} className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-white divide-y md:divide-y-0 md:divide-x divide-white/20">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2 py-4 md:py-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-1">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-4xl font-extrabold tracking-tight">{value}</div>
                <div className="text-blue-100 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2e6be4] text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border border-blue-100">
              Everything you need
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Built for agencies.{' '}
              <span className="text-transparent bg-clip-text brand-gradient">
                Loved by performance marketers.
              </span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
              Every feature is designed around how real marketing teams actually work — across platforms, clients, and campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all group">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 bg-[#f0f5ff]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-[#2e6be4] text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              How it works
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              From setup to insights in three steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-8 left-[33%] right-[33%] h-0.5 bg-gradient-to-r from-[#2e6be4]/30 via-[#2e6be4]/60 to-[#2e6be4]/30" />

            {STEPS.map(({ num, title, desc, badge }, i) => (
              <div key={num} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl font-extrabold text-transparent bg-clip-text brand-gradient leading-none">
                      {num}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#2e6be4] border border-blue-100">
                      {badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  {i < STEPS.length - 1 && (
                    <div className="lg:hidden mt-4 flex justify-center">
                      <ChevronRight className="w-5 h-5 text-blue-200 rotate-90" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ── */}
      <section id="platforms" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2e6be4] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-blue-100">
                Platform Support
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                One platform.<br />Five paid channels.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Camparc manages naming conventions, performance data, and audience overlap across all the major paid media platforms your clients run — from a single workspace.
              </p>
              <ul className="space-y-2">
                {[
                  'Unified campaign naming across all platforms',
                  'Cross-platform performance in one dashboard',
                  'Audience overlap detection between channels',
                  'One-click client-ready exports',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#2e6be4] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { name: 'Meta', desc: 'Facebook & Instagram Ads', stats: '2.1B daily active users', color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
                { name: 'Google Ads', desc: 'Search, Display & Video', stats: '8.5B searches per day', color: 'border-yellow-200 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
                { name: 'TikTok', desc: 'Short-form video ads', stats: '1B+ monthly users', color: 'border-pink-200 bg-pink-50', badge: 'bg-pink-100 text-pink-700' },
                { name: 'DV360', desc: 'Display & Video 360', stats: 'Programmatic reach', color: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-700' },
                { name: 'LinkedIn', desc: 'B2B professional network', stats: '900M+ professionals', color: 'border-sky-200 bg-sky-50', badge: 'bg-sky-100 text-sky-700' },
              ].map(({ name, desc, stats, color, badge }) => (
                <div key={name} className={`flex items-center justify-between p-3.5 rounded-xl border ${color}`}>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
                    {stats}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 bg-[#f0f5ff]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="flex justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Trusted by performance marketing teams
            </h2>
            <p className="text-gray-500 text-sm mt-2">Join agencies that have standardized their campaign operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ quote, name, role, initials }) => (
              <div key={name} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">"{quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
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

      {/* ── PRICING TEASER ── */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2e6be4] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-blue-100">
            Simple Pricing
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            Start free. Scale when you're ready.
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-lg mx-auto">
            Full access from day one. No credit card, no hidden fees. Upgrade when your team grows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                plan: 'Starter', price: 'Free', desc: 'Perfect to try Camparc',
                features: ['1 workspace', '3 team members', '5 campaigns/month', 'Basic analytics'],
                cta: 'Get Started Free', highlight: false,
              },
              {
                plan: 'Agency', price: '$49/mo', desc: 'For growing agencies',
                features: ['Unlimited campaigns', '10 team members', 'All platforms', 'Audience overlap detection', 'Client exports', 'White-label branding'],
                cta: 'Start Free Trial', highlight: true,
              },
              {
                plan: 'Enterprise', price: 'Custom', desc: 'For large teams',
                features: ['Unlimited workspaces', 'Unlimited members', 'SSO & advanced RBAC', 'Dedicated support', 'Custom integrations'],
                cta: 'Contact Sales', highlight: false,
              },
            ].map(({ plan, price, desc, features, cta, highlight }) => (
              <div key={plan}
                className={`rounded-2xl p-6 border text-left flex flex-col ${
                  highlight
                    ? 'border-[#2e6be4] shadow-lg shadow-blue-100 bg-blue-50 relative'
                    : 'border-gray-200 bg-white'
                }`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="brand-gradient text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-900 mb-1">{plan}</p>
                  <p className="text-2xl font-extrabold text-gray-900 mb-1">{price}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${highlight ? 'text-[#2e6be4]' : 'text-gray-400'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    highlight
                      ? 'brand-gradient text-white hover:opacity-90 shadow-sm'
                      : 'border border-gray-200 text-gray-700 hover:border-[#2e6be4] hover:text-[#2e6be4]'
                  }`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-12 bg-[#f0f5ff]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="brand-gradient rounded-2xl p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-24 -translate-y-24 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-16 translate-y-16 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-extrabold mb-2 tracking-tight">
                  Standardize your campaigns today.
                </h2>
                <p className="text-blue-100/80 text-sm max-w-md">
                  Set up your workspace in minutes. No credit card required. Invite your team and start naming campaigns the right way.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2e6be4] font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm whitespace-nowrap">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/15 text-white font-semibold rounded-xl border border-white/25 hover:bg-white/20 transition-colors text-sm whitespace-nowrap">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#07112b] text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white text-base">Camparc</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                The campaign naming and intelligence platform built for modern marketing agencies.
              </p>
              <div className="flex items-center gap-3 mt-4">
                {PLATFORMS.slice(0, 3).map(({ name }) => (
                  <span key={name} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{name}</span>
                ))}
                <span className="text-xs text-gray-600">+2 more</span>
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'How It Works', 'Platforms', 'Pricing', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact', 'Privacy'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-white font-semibold text-sm mb-3">{title}</p>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Camparc. All rights reserved.</p>
            <div className="flex items-center gap-5">
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
