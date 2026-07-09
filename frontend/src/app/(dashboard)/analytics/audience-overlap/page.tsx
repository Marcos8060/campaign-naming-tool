'use client';

import { useState } from 'react';
import { useGet } from '@/lib/hooks/api';
import { AlertTriangle, TrendingDown, Users } from 'lucide-react';
import Link from 'next/link';
import type { OverlapPair } from '@/types/analytics';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

function OverlapBadge({ pct }: { pct: number }) {
  const tone = pct >= 50 ? 'danger' : pct >= 20 ? 'warning' : 'success';
  return <Badge tone={tone} className="font-bold">{pct}%</Badge>;
}

export default function AudienceOverlapPage() {
  const [platform, setPlatform] = useState('');

  const params = platform ? `?platform=${platform}` : '';
  const { data, isLoading } = useGet({
    url: `/analytics/audience-overlap${params}`,
    queryKey: ['analytics', 'audience-overlap', platform],
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
        <Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-auto">
          <option value="">All Platforms</option>
          {['meta', 'google_ads', 'tiktok', 'dv360', 'linkedin'].map(p => (
            <option key={p} value={p}>{p.replace('_', ' ')}</option>
          ))}
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="outlined" padding="md">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium text-gray-600">Campaigns Analyzed</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data?.campaigns?.length || 0}</p>
        </Card>
        <Card variant="outlined" padding="md" className="border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium text-gray-600">High Overlap Pairs</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{highOverlaps.length}</p>
          <p className="text-xs text-gray-500 mt-1">≥50% audience overlap</p>
        </Card>
        <Card variant="outlined" padding="md" className="border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-500" />
            <p className="text-sm font-medium text-gray-600">Est. Wasted Spend</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">${totalWasted.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">from high-overlap campaigns</p>
        </Card>
      </div>

      {isLoading ? (
        <Card variant="outlined" padding="lg" className="text-center text-gray-400">
          Analyzing audience overlaps...
        </Card>
      ) : data?.campaigns?.length < 2 ? (
        <Card variant="outlined" padding="lg" className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Not enough active campaigns to analyze</p>
          <p className="text-sm text-gray-400 mt-1">You need at least 2 active or paused campaigns</p>
          <Button href="/campaigns/create" variant="primary" className="inline-flex mt-4">
            Create Campaign
          </Button>
        </Card>
      ) : (
        <>
          {highOverlaps.length > 0 && (
            <Card variant="outlined" padding="none" className="border-red-200">
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
                            <Link href={`/campaigns/${pair.campaign_a_id}`} className="text-sm font-mono font-medium text-primary hover:underline truncate block">
                              {pair.campaign_a_name}
                            </Link>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Campaign B</p>
                            <Link href={`/campaigns/${pair.campaign_b_id}`} className="text-sm font-mono font-medium text-primary hover:underline truncate block">
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
            </Card>
          )}

          <Card variant="outlined" padding="none">
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
                      <Link href={`/campaigns/${pair.campaign_a_id}`} className="font-mono text-primary hover:underline truncate max-w-44 block">
                        {pair.campaign_a_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/campaigns/${pair.campaign_b_id}`} className="font-mono text-primary hover:underline truncate max-w-44 block">
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
          </Card>
        </>
      )}
    </div>
  );
}
