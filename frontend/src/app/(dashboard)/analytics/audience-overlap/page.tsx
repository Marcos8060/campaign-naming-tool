'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { AlertTriangle, TrendingDown, Users } from 'lucide-react';
import Link from 'next/link';
import type { OverlapPair } from '@/types/analytics';

function OverlapBadge({ pct }: { pct: number }) {
  const color = pct >= 50 ? 'bg-red-100 text-red-700 border-red-200' :
                pct >= 20 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-green-100 text-green-700 border-green-200';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {pct}%
    </span>
  );
}

export default function AudienceOverlapPage() {
  const [platform, setPlatform] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audience-overlap', platform],
    queryFn: async () => {
      const params = platform ? `?platform=${platform}` : '';
      const { data } = await apiClient.get(`/analytics/audience-overlap${params}`);
      return data;
    },
  });

  const highOverlaps = data?.high_overlap_pairs || [];
  const allOverlaps = data?.overlaps || [];
  const totalWasted = (highOverlaps as OverlapPair[]).reduce((sum, p) => sum + (p.wasted_spend_estimate || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audience Overlap Detection</h1>
        <p className="text-gray-500 mt-1">Identify duplicate targeting across campaigns to eliminate wasted spend</p>
      </div>

      <div className="flex gap-3 items-center">
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Platforms</option>
          {['meta', 'google_ads', 'tiktok', 'dv360', 'linkedin'].map(p => (
            <option key={p} value={p}>{p.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <p className="text-sm font-medium text-gray-600">Campaigns Analyzed</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data?.campaigns?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium text-gray-600">High Overlap Pairs</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{highOverlaps.length}</p>
          <p className="text-xs text-gray-500 mt-1">≥50% audience overlap</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-500" />
            <p className="text-sm font-medium text-gray-600">Est. Wasted Spend</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">${totalWasted.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">from high-overlap campaigns</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          Analyzing audience overlaps...
        </div>
      ) : data?.campaigns?.length < 2 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Not enough active campaigns to analyze</p>
          <p className="text-sm text-gray-400 mt-1">You need at least 2 active or paused campaigns</p>
          <Link href="/campaigns/create" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-colors">
            Create Campaign
          </Link>
        </div>
      ) : (
        <>
          {highOverlaps.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200">
              <div className="px-6 py-4 border-b border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-900">High Overlap Pairs — Action Required</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {(highOverlaps as OverlapPair[]).map((pair, i) => (
                  <div key={i} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <OverlapBadge pct={pair.overlap_percentage} />
                          <span className="text-xs text-gray-500">overlap</span>
                          {pair.wasted_spend_estimate > 0 && (
                            <span className="text-xs text-red-600 font-medium">~${pair.wasted_spend_estimate.toLocaleString()} wasted</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Campaign A</p>
                            <Link href={`/campaigns/${pair.campaign_a_id}`} className="text-sm font-mono font-medium text-blue-600 hover:underline truncate block">
                              {pair.campaign_a_name}
                            </Link>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Campaign B</p>
                            <Link href={`/campaigns/${pair.campaign_b_id}`} className="text-sm font-mono font-medium text-blue-600 hover:underline truncate block">
                              {pair.campaign_b_name}
                            </Link>
                          </div>
                        </div>
                        {Object.keys(pair.shared_taxonomy || {}).length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Shared taxonomy values:</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(pair.shared_taxonomy ?? {}).map(([k, v]) => (
                                <span key={k} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-3 italic">
                          Recommendation: Consider excluding shared audiences from one campaign, or consolidate them.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">All Campaign Pairs</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Campaign A', 'Campaign B', 'Overlap', 'Est. Wasted Spend'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(allOverlaps as OverlapPair[]).sort((a, b) => b.overlap_percentage - a.overlap_percentage).map((pair, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/campaigns/${pair.campaign_a_id}`} className="font-mono text-blue-600 hover:underline truncate max-w-44 block">
                        {pair.campaign_a_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/campaigns/${pair.campaign_b_id}`} className="font-mono text-blue-600 hover:underline truncate max-w-44 block">
                        {pair.campaign_b_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><OverlapBadge pct={pair.overlap_percentage} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pair.wasted_spend_estimate > 0 ? `$${pair.wasted_spend_estimate.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
