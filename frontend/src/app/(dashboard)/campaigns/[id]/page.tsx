'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { ArrowLeft, Edit2, Copy, Play, Pause, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type { Campaign, Taxonomy, ApiErrorResponse } from '@/types';
import type { CampaignUpdatePayload, EditModalProps } from '@/types/campaign-detail';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  archived: 'bg-red-100 text-red-700 border-red-200',
};

const OBJECTIVES = ['awareness', 'consideration', 'conversion', 'retention', 'traffic', 'leads'];


function EditModal({ campaign, taxonomies, onClose, onSave, isPending }: EditModalProps) {
  const [form, setForm] = useState({
    name: campaign.name || '',
    objective: campaign.objective || '',
    budget_total: campaign.budget_total ? String(campaign.budget_total) : '',
    budget_daily: campaign.budget_daily ? String(campaign.budget_daily) : '',
    start_date: campaign.start_date || '',
    end_date: campaign.end_date || '',
    taxonomy_values: (campaign.taxonomy_values || {}) as Record<string, string>,
  });

  const taxonomyTypes: string[] = Array.from(new Set(taxonomies.map((t) => t.type)));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900 text-lg">Edit Campaign</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
            <select
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select objective…</option>
              {OBJECTIVES.map((o) => (
                <option key={o} value={o} className="capitalize">
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
              <input
                type="number" min="0" value={form.budget_total}
                onChange={(e) => setForm({ ...form, budget_total: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget ($)</label>
              <input
                type="number" min="0" value={form.budget_daily}
                onChange={(e) => setForm({ ...form, budget_daily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {taxonomyTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taxonomy Values</label>
              <div className="space-y-3">
                {taxonomyTypes.map((type) => (
                  <div key={type}>
                    <label className="block text-xs text-gray-500 mb-1 capitalize">{type}</label>
                    <select
                      value={form.taxonomy_values[type] || ''}
                      onChange={(e) =>
                        setForm({ ...form, taxonomy_values: { ...form.taxonomy_values, [type]: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— none —</option>
                      {taxonomies
                        .filter((t) => t.type === type)
                        .map((t) => (
                          <option key={t.id} value={t.code}>
                            {t.name} ({t.code})
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                ...form,
                budget_total: form.budget_total ? Number(form.budget_total) : null,
                budget_daily: form.budget_daily ? Number(form.budget_daily) : null,
                start_date: form.start_date || null,
                end_date: form.end_date || null,
              })
            }
            disabled={!form.name || isPending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);

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
        <EditModal
          campaign={campaign}
          taxonomies={taxonomies}
          onClose={() => setShowEdit(false)}
          onSave={(data) => updateMutation.mutate(data)}
          isPending={updateMutation.isPending}
        />
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
              className="inline-flex items-center gap-2 px-3 py-2 border border-green-300 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors">
              <Play className="w-4 h-4" /> Activate
            </button>
          )}
          <button onClick={() => duplicateMutation.mutate()} disabled={duplicateMutation.isPending}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Copy className="w-4 h-4" /> Duplicate
          </button>
          {campaign.status !== 'archived' && (
            <button
              onClick={() => { if (confirm('Archive this campaign?')) archiveMutation.mutate(); }}
              disabled={archiveMutation.isPending}
              className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              title="Archive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
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
                <span className="font-mono text-sm font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
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
              className="text-blue-500 hover:text-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
