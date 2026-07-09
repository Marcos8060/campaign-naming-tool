'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost, usePatch, useDelete } from '@/lib/hooks/api';
import Link from 'next/link';
import { ArrowLeft, Edit2, Copy, Play, Pause, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Campaign, Taxonomy } from '@/types';
import type { CampaignUpdatePayload } from '@/types/campaign-detail';
import { CampaignEditModal } from '@/components/campaigns/CampaignEditModal';
import { Modal } from '@/components/ui/Modal';
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

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManage: canEdit } = useRole();
  const [showEdit, setShowEdit] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const { data: campaign, isLoading } = useGet<Campaign>({ url: `/campaigns/${id}`, queryKey: ['campaign', id] });

  const { data: taxonomies = [] } = useGet<Taxonomy[]>({ url: '/taxonomies', enabled: showEdit });

  const statusMutation = usePatch<Campaign, string>({
    url: `/campaigns/${id}/status`,
    body: (status: string) => ({ status }),
    onSuccess: (data) => {
      queryClient.setQueryData(['campaign', id], data);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success(`Campaign ${data.status}`);
    },
  });

  const updateMutation = usePatch<Campaign, CampaignUpdatePayload>({
    url: `/campaigns/${id}`,
    onSuccess: (data) => {
      queryClient.setQueryData(['campaign', id], data);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowEdit(false);
      toast.success('Campaign updated');
    },
    onError: (err) => toast.error(err.message || 'Failed to update'),
  });

  const duplicateMutation = usePost<Campaign, void>({
    url: `/campaigns/${id}/duplicate`,
    body: {},
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign duplicated');
      router.push(`/campaigns/${data.id}`);
    },
  });

  const archiveMutation = useDelete<void, void>({
    url: `/campaigns/${id}`,
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

      <Modal
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowArchiveConfirm(false)}>Cancel</Button>
            <Button
              variant="destructive"
              loading={archiveMutation.isPending}
              onClick={() => { setShowArchiveConfirm(false); archiveMutation.mutate(); }}
            >
              Archive
            </Button>
          </>
        }
      >
        <h3 className="text-base font-semibold text-gray-900 mb-2">Archive campaign?</h3>
        <p className="text-sm text-gray-500">
          This will archive <span className="font-medium text-gray-800">{campaign.name}</span>.
          It will no longer appear in active campaigns.
        </p>
      </Modal>

      <div className="flex items-center gap-4">
        <Link href="/campaigns" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 font-mono truncate">{campaign.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge tone={STATUS_TONE[campaign.status] ?? 'neutral'}>{campaign.status}</Badge>
            <span className="text-gray-500 text-sm capitalize">{campaign.platform?.replace('_', ' ')}</span>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2 flex-shrink-0">
            {campaign.status !== 'archived' && campaign.status !== 'completed' && (
              <Button variant="outline" icon={<Edit2 className="w-4 h-4" />} onClick={() => setShowEdit(true)}>
                Edit
              </Button>
            )}
            {campaign.status === 'active' ? (
              <Button
                variant="outline"
                icon={<Pause className="w-4 h-4" />}
                loading={statusMutation.isPending}
                onClick={() => statusMutation.mutate('paused')}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                Pause
              </Button>
            ) : campaign.status !== 'archived' && campaign.status !== 'completed' && (
              <Button
                variant="outline"
                icon={<Play className="w-4 h-4" />}
                loading={statusMutation.isPending}
                onClick={() => statusMutation.mutate('active')}
                className="border-positive/30 text-positive hover:bg-positive-soft"
              >
                Activate
              </Button>
            )}
            <Button
              variant="outline"
              icon={<Copy className="w-4 h-4" />}
              loading={duplicateMutation.isPending}
              onClick={() => duplicateMutation.mutate()}
            >
              Duplicate
            </Button>
            {campaign.status !== 'archived' && (
              <Button
                variant="outline"
                size="icon"
                title="Archive"
                loading={archiveMutation.isPending}
                onClick={() => setShowArchiveConfirm(true)}
                className="border-red-200 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="outlined" padding="lg" className="space-y-3">
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
        </Card>

        <Card variant="outlined" padding="lg" className="space-y-3">
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
        </Card>

        {Object.keys(taxonomyValues).length > 0 && (
          <Card variant="outlined" padding="lg" className="space-y-3">
            <h3 className="font-semibold text-gray-900">Taxonomy Breakdown</h3>
            {Object.entries(taxonomyValues).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-500 capitalize">{key}</span>
                <span className="font-mono text-sm font-medium text-primary bg-primary-soft px-2 py-0.5 rounded">
                  {String(value)}
                </span>
              </div>
            ))}
          </Card>
        )}

        <Card variant="outlined" padding="lg">
          <h3 className="font-semibold text-gray-900 mb-4">Generated Name</h3>
          <div className="bg-gray-900 rounded-lg px-4 py-3">
            <p className="font-mono text-green-400 text-sm font-bold break-all">{campaign.name}</p>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{campaign.name.length} characters</span>
            <Button
              variant="text"
              size="sm"
              onClick={() => { navigator.clipboard.writeText(campaign.name); toast.success('Copied to clipboard'); }}
            >
              Copy
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
