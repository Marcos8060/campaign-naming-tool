'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/lib/hooks/useRole';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { Campaign, CampaignsListResponse } from '@/types';
import { SortButton } from '@/components/campaigns/SortButton';
import { ActionMenu } from '@/components/campaigns/ActionMenu';

const PLATFORM_COLORS: Record<string, string> = {
  meta: 'bg-blue-100 text-blue-700',
  google_ads: 'bg-yellow-100 text-yellow-700',
  tiktok: 'bg-pink-100 text-pink-700',
  dv360: 'bg-green-100 text-green-700',
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

  const { data, isLoading } = useQuery<CampaignsListResponse>({
    queryKey: ['campaigns', { platform, status, search: debouncedSearch, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams({ sort_by: sortBy, sort_order: sortOrder, limit: '100' });
      if (platform) params.set('platform', platform);
      if (status) params.set('status', status);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const { data } = await apiClient.get<CampaignsListResponse>(`/campaigns?${params}`);
      return data;
    },
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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/campaigns/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Status updated');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/campaigns/${id}/duplicate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign duplicated');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/campaigns/${id}`),
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
            className="inline-flex text-sm items-center gap-2 px-4 py-2 bg-[#2e6be4] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Platforms</option>
          {['meta', 'google_ads', 'tiktok', 'dv360', 'linkedin'].map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          {['draft', 'active', 'paused', 'completed'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        {(platform || status || search) && (
          <button onClick={() => { setPlatform(''); setStatus(''); setSearch(''); }}
            className="text-sm text-gray-500 hover:text-gray-700 underline">Clear filters</button>
        )}
      </div>

      {/* Bulk actions bar — managers/admins only */}
      {canCreate && selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-blue-800">{selected.size} selected</span>
          <div className="flex gap-2 ml-2">
            <button onClick={() => handleBulkAction('activate')} className="px-3 py-1 bg-green-600 text-white text-xs rounded font-medium hover:bg-green-700">Activate</button>
            <button onClick={() => handleBulkAction('pause')} className="px-3 py-1 bg-yellow-500 text-white text-xs rounded font-medium hover:bg-yellow-600">Pause</button>
            <button onClick={() => handleBulkAction('archive')} className="px-3 py-1 bg-red-600 text-white text-xs rounded font-medium hover:bg-red-700">Archive</button>
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-blue-600 hover:underline">Clear</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">{search || platform || status ? 'No campaigns match your filters.' : 'No campaigns yet.'}</p>
            {!search && !platform && !status && canCreate && (
              <Link href="/campaigns/create" className="text-blue-600 hover:underline text-sm font-medium">
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
                    <Link href={`/campaigns/${campaign.id}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm block truncate max-w-56">
                      {campaign.name}
                    </Link>
                    {campaign.platform_id && <p className="text-xs text-gray-400 font-mono">{campaign.platform_id}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${PLATFORM_COLORS[campaign.platform] || 'bg-gray-100 text-gray-700'}`}>
                      {campaign.platform?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                      ${campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'}`}>
                      {campaign.status}
                    </span>
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
      </div>
    </div>
  );
}
