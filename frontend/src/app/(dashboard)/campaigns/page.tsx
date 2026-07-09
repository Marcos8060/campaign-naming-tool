'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePatch, usePost, useDelete } from '@/lib/hooks/api';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/lib/hooks/useRole';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { Campaign, CampaignsListResponse } from '@/types';
import { SortButton } from '@/components/campaigns/SortButton';
import { ActionMenu } from '@/components/campaigns/ActionMenu';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeProps } from '@/components/ui/Badge';

const STATUS_TONE: Record<string, BadgeProps['tone']> = {
  active: 'success',
  draft: 'neutral',
  paused: 'warning',
  completed: 'primary',
  archived: 'danger',
};

const PLATFORM_COLORS: Record<string, string> = {
  meta: 'bg-blue-100 text-primary',
  google_ads: 'bg-yellow-100 text-yellow-700',
  tiktok: 'bg-pink-100 text-pink-700',
  dv360: 'bg-positive-soft text-positive',
  linkedin: 'bg-indigo-100 text-indigo-700',
};

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const { canManage: canCreate } = useRole();
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const params = new URLSearchParams({ sort_by: sortBy, sort_order: sortOrder, limit: '100' });
  if (platform) params.set('platform', platform);
  if (status) params.set('status', status);
  if (debouncedSearch) params.set('search', debouncedSearch);

  const { data, isLoading } = useGet<CampaignsListResponse>({
    url: `/campaigns?${params}`,
    queryKey: ['campaigns', { platform, status, search: debouncedSearch, sortBy, sortOrder }],
  });

  const campaigns: Campaign[] = data?.campaigns ?? [];

  const handleSort = useCallback((col: string) => {
    if (sortBy === col) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  }, [sortBy]);

  const statusMutation = usePatch<Campaign, { id: string; status: string }>({
    url: ({ id }) => `/campaigns/${id}/status`,
    body: ({ status }: { id: string; status: string }) => ({ status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Status updated');
    },
  });

  const duplicateMutation = usePost<Campaign, string>({
    url: (id) => `/campaigns/${id}/duplicate`,
    body: {},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign duplicated');
    },
  });

  const archiveMutation = useDelete<void, string>({
    url: (id) => `/campaigns/${id}`,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign archived');
    },
  });

  const handleAction = (action: string, id: string) => {
    if (action === 'duplicate') duplicateMutation.mutate(id);
    else if (action === 'activate') statusMutation.mutate({ id, status: 'active' });
    else if (action === 'pause') statusMutation.mutate({ id, status: 'paused' });
    else if (action === 'archive') archiveMutation.mutate(id);
  };

  const handleBulkAction = (action: string) => {
    const ids = Array.from(selected);
    if (action === 'archive') ids.forEach(id => archiveMutation.mutate(id));
    else if (action === 'activate') ids.forEach(id => statusMutation.mutate({ id, status: 'active' }));
    else if (action === 'pause') ids.forEach(id => statusMutation.mutate({ id, status: 'paused' }));
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === campaigns.length) setSelected(new Set());
    else setSelected(new Set(campaigns.map((c) => c.id)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 mt-1">
            {data?.total !== undefined
              ? `Showing ${campaigns.length} of ${data.total} campaigns`
              : 'Loading...'}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/campaigns/create"
            className="inline-flex text-sm items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Platforms</option>
          {['meta', 'google_ads', 'tiktok', 'dv360', 'linkedin'].map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Statuses</option>
          {['draft', 'active', 'paused', 'completed'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        {(platform || status || search) && (
          <Button variant="text" className="text-gray-500 hover:text-gray-700 underline"
            onClick={() => { setPlatform(''); setStatus(''); setSearch(''); }}>Clear filters</Button>
        )}
      </div>

      {/* Bulk actions bar — managers/admins only */}
      {canCreate && selected.size > 0 && (
        <div className="flex items-center gap-3 bg-primary-soft border border-primary/20 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-primary">{selected.size} selected</span>
          <div className="flex gap-2 ml-2">
            <Button size="sm" className="bg-positive hover:bg-positive-hover" onClick={() => handleBulkAction('activate')}>Activate</Button>
            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600" onClick={() => handleBulkAction('pause')}>Pause</Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('archive')}>Archive</Button>
          </div>
          <Button variant="text" size="sm" className="ml-auto" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <Card variant="outlined" padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">{search || platform || status ? 'No campaigns match your filters.' : 'No campaigns yet.'}</p>
            {!search && !platform && !status && canCreate && (
              <Link href="/campaigns/create" className="text-primary hover:underline text-sm font-medium">
                Create your first campaign →
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {canCreate && (
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === campaigns.length && campaigns.length > 0}
                      onChange={toggleAll} className="rounded border-gray-300" />
                  </th>
                )}
                {[
                  { label: <SortButton column="name" current={sortBy} order={sortOrder} onClick={handleSort} />, cls: '' },
                  { label: 'Platform', cls: '' },
                  { label: <SortButton column="status" current={sortBy} order={sortOrder} onClick={handleSort} />, cls: '' },
                  { label: <SortButton column="budget_total" current={sortBy} order={sortOrder} onClick={handleSort} />, cls: '' },
                  { label: <SortButton column="start_date" current={sortBy} order={sortOrder} onClick={handleSort} />, cls: 'hidden md:table-cell' },
                  ...(canCreate ? [{ label: '', cls: 'w-10' }] : []),
                ].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${h.cls}`}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className={`hover:bg-gray-50 ${selected.has(campaign.id) ? 'bg-blue-50' : ''}`}>
                  {canCreate && (
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(campaign.id)}
                        onChange={() => toggleSelect(campaign.id)} className="rounded border-gray-300" />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Link href={`/campaigns/${campaign.id}`} className="font-medium text-gray-900 hover:text-primary text-sm block truncate max-w-56">
                      {campaign.name}
                    </Link>
                    {campaign.platform_id && <p className="text-xs text-gray-400 font-mono">{campaign.platform_id}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral" className={PLATFORM_COLORS[campaign.platform] || ''}>
                      {campaign.platform?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[campaign.status] ?? 'neutral'}>{campaign.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {campaign.budget_total ? `$${Number(campaign.budget_total).toLocaleString()}` : '—'}
                    {campaign.budget_daily && <span className="text-gray-400 text-xs ml-1">/ ${Number(campaign.budget_daily).toLocaleString()}d</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                    {campaign.start_date ? `${campaign.start_date}${campaign.end_date ? ' → ' + campaign.end_date : ''}` : '—'}
                  </td>
                  {canCreate && (
                    <td className="px-4 py-3">
                      <ActionMenu campaign={campaign} onAction={handleAction} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
