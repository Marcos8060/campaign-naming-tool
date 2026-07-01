'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { ArrowLeft, Edit2, Copy, Play, Pause, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type { Campaign, Taxonomy, ApiErrorResponse } from '@/types';
import type { CampaignUpdatePayload } from '@/types/campaign-detail';
import { CampaignEditModal } from '@/components/campaigns/CampaignEditModal';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-positive-soft text-positive border-positive/20',
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-blue-100 text-primary border-primary/20',
  archived: 'bg-red-100 text-red-700 border-red-200',
};

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManage: canEdit } = useRole();
  const [showEdit, setShowEdit] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Campaign>(`/campaigns/${id}`);
      return data;
    },
  });

  const { data: taxonomies = [] } = useQuery<Taxonomy[]>({
    queryKey: ['taxonomies'],
    queryFn: async () => {
      const { data } = await apiClient.get<Taxonomy[]>('/taxonomies');
      return data;
    },
    enabled: showEdit,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => apiClient.patch<Campaign>(`/campaigns/${id}/status`, { status }),
    onSuccess: (res) => {
      queryClient.setQueryData(['campaign', id], res.data);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success(`Campaign ${res.data.status}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: CampaignUpdatePayload) => apiClient.patch<Campaign>(`/campaigns/${id}`, body),
    onSuccess: (res) => {
      queryClient.setQueryData(['campaign', id], res.data);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowEdit(false);
      toast.success('Campaign updated');
    },
    onError: (err) => {
      const message = err instanceof AxiosError
        ? (err.response?.data as ApiErrorResponse)?.detail
        : undefined;
      toast.error(message || 'Failed to update');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => apiClient.post<Campaign>(`/campaigns/${id}/duplicate`, {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign duplicated');
      router.push(`/campaigns/${res.data.id}`);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiClient.delete(`/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign archived');
      router.push('/campaigns');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!campaign) return <div className="text-gray-500">Campaign not found</div>;

  const taxonomyValues: Record<string, string> = campaign.taxonomy_values || {};

  return (
    <div className="max-w-4xl space-y-6">
      {showEdit && (
        <CampaignEditModal
          campaign={campaign}
          taxonomies={taxonomies}
          onClose={() => setShowEdit(false)}
          onSave={(data) => updateMutation.mutate(data)}
          isPending={updateMutation.isPending}
        />
      )}

      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowArchiveConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Archive campaign?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will archive <span className="font-medium text-gray-800">{campaign.name}</span>.
              It will no longer appear in active campaigns.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowArchiveConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { setShowArchiveConfirm(false); archiveMutation.mutate(); }}
                disabled={archiveMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/campaigns" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 font-mono truncate">{campaign.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[campaign.status] || ''}`}>
              {campaign.status}
            </span>
            <span className="text-gray-500 text-sm capitalize">{campaign.platform?.replace('_', ' ')}</span>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2 flex-shrink-0">
            {campaign.status !== 'archived' && campaign.status !== 'completed' && (
              <button onClick={() => setShowEdit(true)}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
            {campaign.status === 'active' ? (
              <button onClick={() => statusMutation.mutate('paused')} disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 px-3 py-2 border border-yellow-300 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-50 transition-colors">
                <Pause className="w-4 h-4" /> Pause
              </button>
            ) : campaign.status !== 'archived' && campaign.status !== 'completed' && (
              <button onClick={() => statusMutation.mutate('active')} disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 px-3 py-2 border border-positive/30 text-positive text-sm font-medium rounded-lg hover:bg-positive-soft transition-colors">
                <Play className="w-4 h-4" /> Activate
              </button>
            )}
            <button onClick={() => duplicateMutation.mutate()} disabled={duplicateMutation.isPending}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Copy className="w-4 h-4" /> Duplicate
            </button>
            {campaign.status !== 'archived' && (
              <button
                onClick={() => setShowArchiveConfirm(true)}
                disabled={archiveMutation.isPending}
                className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="Archive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Campaign Details</h3>
          {[
            { label: 'Platform', value: campaign.platform?.replace('_', ' ') },
            { label: 'Platform ID', value: campaign.platform_id || '—' },
            { label: 'Objective', value: campaign.objective || '—' },
            { label: 'Status', value: campaign.status },
            { label: 'Created by', value: campaign.created_by_name || '—' },
            { label: 'Created', value: campaign.created_at ? new Date(campaign.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—' },
            { label: 'Last updated', value: campaign.updated_at ? new Date(campaign.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900 capitalize">{value}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Budget & Schedule</h3>
          {[
            { label: 'Total Budget', value: campaign.budget_total ? `$${Number(campaign.budget_total).toLocaleString()}` : '—' },
            { label: 'Daily Budget', value: campaign.budget_daily ? `$${Number(campaign.budget_daily).toLocaleString()}` : '—' },
            { label: 'Start Date', value: campaign.start_date || '—' },
            { label: 'End Date', value: campaign.end_date || 'Ongoing' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {Object.keys(taxonomyValues).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Taxonomy Breakdown</h3>
            {Object.entries(taxonomyValues).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-500 capitalize">{key}</span>
                <span className="font-mono text-sm font-medium text-primary bg-primary-soft px-2 py-0.5 rounded">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Generated Name</h3>
          <div className="bg-gray-900 rounded-lg px-4 py-3">
            <p className="font-mono text-green-400 text-sm font-bold break-all">{campaign.name}</p>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{campaign.name.length} characters</span>
            <button
              onClick={() => { navigator.clipboard.writeText(campaign.name); toast.success('Copied to clipboard'); }}
              className="text-primary hover:text-primary-hover"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
