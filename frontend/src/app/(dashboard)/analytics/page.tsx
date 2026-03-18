'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Eye, Target, AlertTriangle } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import type { PlatformStat, TopCampaign } from '@/types';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  color: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const DATE_PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

function KPICard({ title, value, change, icon: Icon, color }: KPICardProps) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}% vs prev period
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/overview');
      return data;
    },
  });

  const { data: performance } = useQuery({
    queryKey: ['analytics', 'performance', days],
    queryFn: async () => {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
      const { data } = await apiClient.get(`/analytics/performance?start_date=${start}&end_date=${end}`);
      return data;
    },
  });

  const { data: budget } = useQuery({
    queryKey: ['analytics', 'budget'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/budget-intelligence');
      return data;
    },
  });

  const { data: topCampaigns } = useQuery({
    queryKey: ['analytics', 'top-campaigns'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/top-campaigns?limit=10');
      return data;
    },
  });

  const platformData = (overview?.platforms as PlatformStat[] | undefined)?.map((p) => ({
    name: p.platform.replace('_', ' '),
    campaigns: Number(p.count),
    budget: Number(p.total_budget),
  })) || [];

  const perf = overview?.performance || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Cross-channel performance intelligence</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {DATE_PRESETS.map(({ label, days: d }) => (
            <button key={label} onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${days === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Spend" value={`$${(perf.total_spend || 0).toLocaleString()}`} icon={DollarSign} color="bg-blue-50 text-blue-600" />
        <KPICard title="Impressions" value={(perf.total_impressions || 0) > 1000000 ? `${((perf.total_impressions || 0) / 1000000).toFixed(1)}M` : (perf.total_impressions || 0).toLocaleString()} icon={Eye} color="bg-purple-50 text-purple-600" />
        <KPICard title="Conversions" value={(perf.total_conversions || 0).toLocaleString()} icon={Target} color="bg-green-50 text-green-600" />
        <KPICard title="Avg ROAS" value={(perf.avg_roas || 0) > 0 ? `${(perf.avg_roas).toFixed(1)}x` : '—'} icon={TrendingUp} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance over time */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Over Time</h3>
          {performance && performance.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#3b82f6" name="Spend ($)" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#10b981" name="Conversions" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-gray-400">
              <p className="text-sm">No performance data for this period</p>
              <p className="text-xs mt-1">Import campaign data to see metrics</p>
            </div>
          )}
        </div>

        {/* Platform distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Campaigns by Platform</h3>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={platformData} dataKey="campaigns" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          )}
        </div>

        {/* Budget by platform */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Budget Allocation</h3>
          {budget && budget.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={budget} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="platform" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v: number | string) => [`$${Number(v).toLocaleString()}`, 'Budget']} />
                <Bar dataKey="total_budget" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Budget" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No budget data</div>
          )}
        </div>
      </div>

      {/* Top campaigns table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Top Performing Campaigns</h3>
          <Link href="/analytics/audience-overlap" className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 font-medium">
            <AlertTriangle className="w-4 h-4" />
            View Audience Overlap
          </Link>
        </div>
        {topCampaigns && topCampaigns.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'Campaign', 'Platform', 'Spend', 'ROAS', 'Conversions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(topCampaigns as TopCampaign[]).map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-400">#{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/campaigns/${c.id}`} className="text-sm font-mono font-medium text-blue-600 hover:underline truncate max-w-52 block">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">{c.platform?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">${(c.total_spend || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${(c.avg_roas || 0) > 2 ? 'text-green-600' : 'text-gray-600'}`}>
                      {(c.avg_roas || 0) > 0 ? `${c.avg_roas.toFixed(1)}x` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(c.total_conversions || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">No performance data yet</div>
        )}
      </div>
    </div>
  );
}
