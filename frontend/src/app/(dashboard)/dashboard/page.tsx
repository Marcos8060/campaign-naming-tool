'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  CheckCircle2, Circle, ArrowRight, TrendingUp, Target,
  DollarSign, Megaphone, Plus, BarChart2, AlertTriangle,
  Sparkles, type LucideIcon,
} from 'lucide-react';
import type { AnalyticsOverview, TopCampaign, CampaignsListResponse, OnboardingStatus, PlatformStat } from '@/types';

const PLATFORM_COLORS: Record<string, string> = {
  meta:       '#6C5CE7',
  google_ads: '#A29BFE',
  tiktok:     '#fd79a8',
  dv360:      '#00b894',
  linkedin:   '#74b9ff',
};

const STATUS_STYLES: Record<string, string> = {
  active:   'bg-emerald-50 text-emerald-700 border border-emerald-100',
  draft:    'bg-gray-100 text-gray-600 border border-gray-200',
  paused:   'bg-amber-50 text-amber-700 border border-amber-100',
  archived: 'bg-red-50 text-red-600 border border-red-100',
  completed:'bg-blue-50 text-blue-700 border border-blue-100',
};

function KpiCard({ title, value, sub, icon: Icon, accent }: {
  title: string; value: string; sub?: string;
  icon: LucideIcon; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + '18' }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

function OnboardingChecklist({ onboarding }: { onboarding: OnboardingStatus | undefined }) {
  if (!onboarding) return null;
  const steps: { key: keyof OnboardingStatus; label: string; href: string | null }[] = [
    { key: 'workspace_created',     label: 'Workspace set up',            href: null },
    { key: 'taxonomies_configured', label: 'Configure taxonomies',        href: '/taxonomies' },
    { key: 'platforms_configured',  label: 'Set platform templates',      href: '/settings/platforms' },
    { key: 'first_campaign_created',label: 'Launch your first campaign',  href: '/campaigns/create' },
  ];
  const done = steps.filter((s) => onboarding[s.key]).length;
  const total = steps.length;
  if (done === total) return null;

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className="brand-gradient px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-white" />
            <div>
              <p className="font-bold text-white text-sm">Getting Started</p>
              <p className="text-violet-200 text-xs">{done} of {total} steps complete</p>
            </div>
          </div>
          <div className="text-white font-extrabold text-lg">{Math.round((done / total) * 100)}%</div>
        </div>
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>
      <div className="p-4 divide-y divide-gray-50">
        {steps.map(({ key, label, href }) => {
          const isDone = onboarding[key];
          return (
            <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                {isDone
                  ? <CheckCircle2 className="w-5 h-5 text-[#6C5CE7] flex-shrink-0" />
                  : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
                <span className={`text-sm font-medium ${isDone ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                  {label}
                </span>
              </div>
              {!isDone && href && (
                <Link href={href}
                  className="inline-flex items-center gap-1 text-xs text-[#6C5CE7] font-semibold hover:underline">
                  Go <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const firstName = user?.name?.split(' ')[0] || 'there';

  const { data: overview, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const { data } = await apiClient.get<AnalyticsOverview>('/analytics/overview');
      return data;
    },
  });

  const { data: campaigns } = useQuery<CampaignsListResponse>({
    queryKey: ['campaigns', { limit: 5 }],
    queryFn: async () => {
      const { data } = await apiClient.get<CampaignsListResponse>('/campaigns?limit=5&sort_by=created_at&sort_order=desc');
      return data;
    },
  });

  const { data: topCampaigns } = useQuery<TopCampaign[]>({
    queryKey: ['analytics', 'top-campaigns'],
    queryFn: async () => {
      const { data } = await apiClient.get<TopCampaign[]>('/analytics/top-campaigns?limit=5');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const platformData = (overview?.platforms ?? []).map((p: PlatformStat) => ({
    name: p.platform.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    campaigns: Number(p.count),
    platform: p.platform,
  }));

  const spend = overview?.performance?.total_spend || 0;
  const roas = overview?.performance?.avg_roas || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Welcome Banner ── */}
      <div className="brand-gradient rounded-2xl p-7 flex items-center justify-between overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full translate-x-20 -translate-y-20" />
        <div className="absolute right-32 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-12" />
        <div className="relative z-10">
          <p className="text-violet-200 text-sm font-medium mb-1">CAMPAIGN INTELLIGENCE PLATFORM</p>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            {greeting}, {firstName} 🔥
          </h1>
          <p className="text-violet-200 text-sm max-w-md">
            {overview?.active_campaigns
              ? `You have ${overview.active_campaigns} active campaign${overview.active_campaigns !== 1 ? 's' : ''} running. Here's your overview.`
              : 'Welcome to Camparc. Set up your taxonomy and launch your first campaign.'}
          </p>
        </div>
        <div className="relative z-10 hidden md:flex gap-3 flex-shrink-0">
          <Link href="/campaigns/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#6C5CE7] font-bold rounded-sm hover:bg-violet-50 transition-colors text-sm shadow-lg">
            <Plus className="w-4 h-4" /> New Campaign
          </Link>
          <Link href="/analytics"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors text-sm border border-white/20">
            <BarChart2 className="w-4 h-4" /> Analytics
          </Link>
        </div>
      </div>

      {/* ── Onboarding ── */}
      <OnboardingChecklist onboarding={overview?.onboarding} />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Campaigns"
          value={String(overview?.total_campaigns ?? 0)}
          sub={`${overview?.active_campaigns ?? 0} active right now`}
          icon={Megaphone}
          accent="#6C5CE7"
        />
        <KpiCard
          title="Active Budget"
          value={`$${(overview?.total_budget ?? 0).toLocaleString()}`}
          sub="across active campaigns"
          icon={DollarSign}
          accent="#00b894"
        />
        <KpiCard
          title="Total Spend (30d)"
          value={`$${spend.toLocaleString()}`}
          sub="last 30 days"
          icon={TrendingUp}
          accent="#0984e3"
        />
        <KpiCard
          title="Avg ROAS"
          value={roas > 0 ? `${roas.toFixed(1)}×` : '—'}
          sub="last 30 days"
          icon={Target}
          accent="#e17055"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Platform bar chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl card-shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Campaigns by Platform</h3>
              <p className="text-xs text-gray-400 mt-0.5">Campaign count per ad channel</p>
            </div>
            <Link href="/analytics" className="text-xs text-[#6C5CE7] font-semibold hover:underline flex items-center gap-1">
              Full report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  cursor={{ fill: '#F0EFFE' }}
                />
                <Bar dataKey="campaigns" radius={[6, 6, 0, 0]} name="Campaigns">
                  {platformData.map((entry: any) => (
                    <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] || '#6C5CE7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mb-3">
                <BarChart2 className="w-6 h-6 text-[#6C5CE7]" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No campaigns yet</p>
              <Link href="/campaigns/create"
                className="text-[#6C5CE7] text-sm font-semibold mt-2 hover:underline flex items-center gap-1">
                Create first campaign <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Top campaigns */}
        <div className="lg:col-span-2 bg-white rounded-2xl card-shadow p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Top Campaigns</h3>
              <p className="text-xs text-gray-400 mt-0.5">By ROAS performance</p>
            </div>
            <Link href="/analytics" className="text-xs text-[#6C5CE7] font-semibold hover:underline">
              See all
            </Link>
          </div>
          <div className="space-y-1">
            {Array.isArray(topCampaigns) && topCampaigns?.length > 0 ? (
              topCampaigns.slice(0, 5).map((c: any, i: number) => (
                <Link key={c.id} href={`/campaigns/${c.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#F8F7FF] transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-extrabold text-gray-300 w-4 flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#6C5CE7] transition-colors">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{c.platform?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-emerald-600">
                      {c.avg_roas > 0 ? `${c.avg_roas.toFixed(1)}×` : '—'}
                    </p>
                    <p className="text-[10px] text-gray-400">ROAS</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm text-gray-400">No performance data yet</p>
                <p className="text-xs text-gray-300 mt-1">Connect platform data to see rankings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Campaigns Table ── */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div>
            <h3 className="font-bold text-gray-900">Recent Campaigns</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest 5 created campaigns</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/campaigns/create"
              className="inline-flex items-center gap-2 px-4 py-2 brand-gradient text-white text-sm font-semibold rounded-sm hover:opacity-90 transition-opacity shadow-sm shadow-violet-200">
              <Plus className="w-4 h-4" /> New Campaigns
            </Link>
            <Link href="/campaigns"
              className="text-sm text-[#6C5CE7] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {Array.isArray(campaigns) && campaigns?.campaigns?.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7FF]">
                {['Campaign Name', 'Platform', 'Status', 'Budget', 'Start Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.campaigns.map((c: any) => (
                <tr key={c.id} className="hover:bg-[#F8F7FF] transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/campaigns/${c.id}`}
                      className="text-sm font-semibold text-gray-900 group-hover:text-[#6C5CE7] transition-colors font-mono truncate max-w-[280px] block">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 capitalize">
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PLATFORM_COLORS[c.platform] || '#6C5CE7' }} />
                      {c.platform?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[c.status] || STATUS_STYLES.draft}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {c.budget_total ? `$${Number(c.budget_total).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {c.start_date || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-7 h-7 text-[#6C5CE7]" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">No campaigns yet</p>
            <p className="text-gray-400 text-sm mb-5">Launch your first campaign using the wizard</p>
            <Link href="/campaigns/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 brand-gradient text-white font-semibold rounded-sm hover:opacity-90 transition-opacity text-sm">
              <Plus className="w-4 h-4" /> Create First Campaign
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
