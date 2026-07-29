'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost, usePatch, useDelete } from '@/lib/hooks/api';
import Link from 'next/link';
import {
  ArrowLeft, Edit2, Copy, Play, Pause, Trash2, Rocket, RefreshCw,
  Info, Wallet, Calendar, UploadCloud, Tag, Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Campaign, Taxonomy } from '@/types';
import type { CampaignUpdatePayload } from '@/types/campaign-detail';
import { CampaignEditModal } from '@/components/campaigns/CampaignEditModal';
import { AdSetsPanel } from '@/components/campaigns/AdSetsPanel';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { formatMoney } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';

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

  const { data: connections } = useGet<{ platform: string; status: string; currency?: string | null }[]>({
    url: '/integrations',
    enabled: campaign?.platform === 'meta',
  });
  const metaConnection = connections?.find((c) => c.platform === 'meta' && c.status === 'connected');
  const metaConnected = !!metaConnection;
  const currencyCode = metaConnection?.currency;

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

  const deployMutation = usePost<Campaign, void>({
    url: `/campaigns/${id}/deploy`,
    body: {},
    onSuccess: (data) => {
      queryClient.setQueryData(['campaign', id], data);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Deployed to Meta — created paused, ready to activate when you are');
    },
    onError: (err) => toast.error(err.message || 'Deploy failed'),
  });

  interface SyncResult {
    days_synced: number;
    total_spend: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    since: string;
    until: string;
  }
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const syncMutation = usePost<SyncResult, void>({
    url: `/campaigns/${id}/sync-performance`,
    body: {},
    onSuccess: (data) => {
      setSyncResult(data);
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      // These feed the dashboard/analytics pages too — they already join
      // against campaign_performance, so a sync here shows up there for free.
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(
        data.days_synced > 0
          ? `Synced ${data.days_synced} day${data.days_synced === 1 ? '' : 's'} of performance data`
          : 'Synced — no delivery recorded on Meta for this period yet',
      );
    },
    onError: (err) => toast.error(err.message || 'Sync failed'),
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

  const createdByInitials = campaign.created_by_name
    ? campaign.created_by_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '—';

  // Duration progress is purely derived from the campaign's own start/end
  // dates — no new data, just a visual read of fields already on the page.
  // Only renders when both ends of the flight are known (an open-ended
  // "Ongoing" campaign has no meaningful percentage to show).
  let durationPercent: number | null = null;
  if (campaign.start_date && campaign.end_date) {
    const start = new Date(campaign.start_date).getTime();
    const end = new Date(campaign.end_date).getTime();
    if (end > start) {
      const elapsed = Math.min(Math.max(Date.now() - start, 0), end - start);
      durationPercent = Math.round((elapsed / (end - start)) * 100);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {showEdit && (
        <CampaignEditModal
          campaign={campaign}
          taxonomies={taxonomies}
          onClose={() => setShowEdit(false)}
          onSave={(data) => updateMutation.mutate(data)}
          isPending={updateMutation.isPending}
          currencyCode={currencyCode}
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

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 min-w-0 sm:flex-1">
          <Link href="/campaigns" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 font-mono break-words">{campaign.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge tone={STATUS_TONE[campaign.status] ?? 'neutral'} className="uppercase tracking-wide">
                {campaign.status}
              </Badge>
              <span className="text-gray-500 text-sm capitalize">{campaign.platform?.replace('_', ' ')} Ads Platform</span>
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
            {campaign.platform === 'meta' && campaign.platform_status !== 'deployed' && campaign.status !== 'archived' && (
              metaConnected ? (
                <Button
                  icon={<Rocket className="w-4 h-4" />}
                  loading={deployMutation.isPending}
                  onClick={() => deployMutation.mutate()}
                >
                  Deploy to Meta
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  icon={<Rocket className="w-4 h-4" />}
                  title="Connect a Meta ad account in Settings → Integrations first"
                >
                  Deploy to Meta
                </Button>
              )
            )}
            {campaign.platform === 'meta' && campaign.platform_id && (
              <Button
                variant="outline"
                icon={<RefreshCw className="w-4 h-4" />}
                loading={syncMutation.isPending}
                onClick={() => syncMutation.mutate()}
              >
                Sync Performance
              </Button>
            )}
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
                icon={<Play className="w-4 h-4" />}
                loading={statusMutation.isPending}
                onClick={() => statusMutation.mutate('active')}
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
          <h3 className="flex items-center gap-2 font-semibold text-gray-900">
            <Info className="w-[18px] h-[18px] text-primary" />
            Campaign Details
          </h3>
          <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
            <span className="text-gray-500">Platform</span>
            <span className="font-medium text-gray-900 capitalize">{campaign.platform?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
            <span className="text-gray-500">Platform ID</span>
            <span className="font-mono font-medium text-gray-900">{campaign.platform_id || '—'}</span>
          </div>
          <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
            <span className="text-gray-500">Objective</span>
            <span className="font-medium text-gray-900 capitalize">{campaign.objective || '—'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
            <span className="text-gray-500">Status</span>
            <Badge tone={STATUS_TONE[campaign.status] ?? 'neutral'} className="uppercase tracking-wide">
              {campaign.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
            <span className="text-gray-500">Created by</span>
            <span className="flex items-center gap-2 font-medium text-gray-900">
              <span className="w-6 h-6 rounded-full primary-gradient flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {createdByInitials}
              </span>
              {campaign.created_by_name || '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
            <span className="text-gray-500">Created</span>
            <span className="font-medium text-gray-900">
              {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last updated</span>
            <span className="font-medium text-gray-900">
              {campaign.updated_at ? new Date(campaign.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
            </span>
          </div>
        </Card>

        <Card variant="outlined" padding="lg" className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900">
            <Wallet className="w-[18px] h-[18px] text-primary" />
            Budget & Schedule
          </h3>
          <div className="bg-primary-soft rounded-xl px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">Total Budget</p>
            <p className="text-2xl font-bold text-primary mt-0.5">{formatMoney(campaign.budget_total, currencyCode)}</p>
          </div>
          <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
            <span className="text-gray-500">Daily Budget</span>
            <span className="font-medium text-gray-900">{formatMoney(campaign.budget_daily, currencyCode)}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Start Date
            </span>
            <span className="font-medium text-gray-900">{campaign.start_date || '—'}</span>
          </div>
          <div className={cn('flex justify-between items-center text-sm', durationPercent === null && 'border-b-0', durationPercent !== null && 'border-b border-gray-100 pb-2')}>
            <span className="text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              End Date
            </span>
            <span className="font-medium text-gray-900">{campaign.end_date || 'Ongoing'}</span>
          </div>
          {durationPercent !== null && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">Duration Progress</span>
                <span className="text-xs text-gray-500">{durationPercent}% Complete</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${durationPercent}%` }} />
              </div>
            </div>
          )}
        </Card>

        {campaign.platform === 'meta' && (
          <Card variant="outlined" padding="lg" className="lg:col-span-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    campaign.platform_status === 'deployed' && 'bg-primary-soft',
                    campaign.platform_status === 'failed' && 'bg-red-50',
                    campaign.platform_status !== 'deployed' && campaign.platform_status !== 'failed' && 'bg-gray-100',
                  )}
                >
                  <UploadCloud
                    className={cn(
                      'w-5 h-5',
                      campaign.platform_status === 'deployed' && 'text-primary',
                      campaign.platform_status === 'failed' && 'text-red-500',
                      campaign.platform_status !== 'deployed' && campaign.platform_status !== 'failed' && 'text-gray-400',
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">Meta Deployment</h3>
                    {campaign.platform_status === 'deployed' && (
                      <Badge tone="success" className="uppercase tracking-wide">Deployed</Badge>
                    )}
                    {campaign.platform_status === 'failed' && (
                      <Badge tone="danger" className="uppercase tracking-wide">Deploy failed</Badge>
                    )}
                    {campaign.platform_status !== 'deployed' && campaign.platform_status !== 'failed' && (
                      <Badge tone="neutral" className="uppercase tracking-wide">Not deployed</Badge>
                    )}
                  </div>
                  {campaign.platform_status === 'deployed' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Created as <span className="font-mono text-gray-700">{campaign.platform_id}</span> on Meta, paused.
                      {' '}{campaign.last_synced_at
                        ? `Performance last synced ${new Date(campaign.last_synced_at).toLocaleString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}.`
                        : 'Performance never synced yet.'}
                      {' '}Camparc also syncs automatically every 6 hours.
                    </p>
                  )}
                  {campaign.platform_status === 'failed' && (
                    <p className="text-sm text-red-600 mt-1">{campaign.platform_error || 'Something went wrong deploying to Meta.'}</p>
                  )}
                  {campaign.platform_status !== 'deployed' && campaign.platform_status !== 'failed' && (
                    <p className="text-sm text-gray-500 mt-1">
                      {metaConnected
                        ? 'This campaign only exists in Camparc so far. Deploy it to create the matching campaign on your connected Meta ad account (paused, ready to activate).'
                        : 'Connect a Meta ad account in Settings → Integrations, then deploy this campaign to push it live.'}
                    </p>
                  )}
                </div>
              </div>
              {campaign.platform_status === 'deployed' && (
                <Button
                  variant="outline"
                  icon={<RefreshCw className="w-4 h-4" />}
                  loading={syncMutation.isPending}
                  onClick={() => syncMutation.mutate()}
                  className="flex-shrink-0"
                >
                  Force Sync
                </Button>
              )}
              {campaign.platform_status === 'failed' && canEdit && metaConnected && (
                <Button
                  variant="outline"
                  icon={<Rocket className="w-4 h-4" />}
                  loading={deployMutation.isPending}
                  onClick={() => deployMutation.mutate()}
                  className="flex-shrink-0"
                >
                  Retry deploy
                </Button>
              )}
            </div>
            {syncResult && (
              <div className="text-sm bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="text-gray-700 font-medium">
                  {syncResult.days_synced > 0
                    ? `${syncResult.days_synced} day${syncResult.days_synced === 1 ? '' : 's'} synced (${syncResult.since} → ${syncResult.until})`
                    : `No delivery recorded (${syncResult.since} → ${syncResult.until})`}
                </p>
                <p className="text-gray-500">
                  {formatMoney(syncResult.total_spend, currencyCode)} spend · {syncResult.total_impressions.toLocaleString()} impressions
                  · {syncResult.total_clicks.toLocaleString()} clicks · {syncResult.total_conversions.toLocaleString()} conversions
                </p>
              </div>
            )}
          </Card>
        )}

        {campaign.platform === 'meta' && (
          <div className="lg:col-span-2">
            <AdSetsPanel
              campaignId={campaign.id}
              platformDeployed={campaign.platform_status === 'deployed'}
              hasCampaignBudget={!!(campaign.budget_daily || campaign.budget_total)}
              currencyCode={currencyCode}
              metaConnected={metaConnected}
            />
          </div>
        )}

        {Object.keys(taxonomyValues).length > 0 && (
          <Card variant="outlined" padding="lg" className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Tag className="w-[18px] h-[18px] text-primary" />
              Taxonomy Breakdown
            </h3>
            {Object.entries(taxonomyValues).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-500 capitalize">{key}</span>
                <span className="font-mono text-xs font-semibold text-primary bg-primary-soft px-2.5 py-1 rounded-full">
                  {String(value)}
                </span>
              </div>
            ))}
          </Card>
        )}

        <Card variant="outlined" padding="lg">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
            <Hash className="w-[18px] h-[18px] text-primary" />
            Generated Name
          </h3>
          <div className="relative bg-gray-900 rounded-lg pl-4 pr-11 py-3">
            <p className="font-mono text-green-400 text-sm font-bold break-all">{campaign.name}</p>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(campaign.name); toast.success('Copied to clipboard'); }}
              title="Copy"
              className="absolute top-2.5 right-2.5 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {campaign.name.length} characters · auto-generated from the campaign taxonomy and ad set settings
          </p>
        </Card>
      </div>
    </div>
  );
}
