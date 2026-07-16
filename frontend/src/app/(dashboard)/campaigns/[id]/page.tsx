'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost, usePatch, useDelete } from '@/lib/hooks/api';
import Link from 'next/link';
import { ArrowLeft, Edit2, Copy, Play, Pause, Trash2, Rocket, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Campaign, Taxonomy } from '@/types';
import type { CampaignUpdatePayload } from '@/types/campaign-detail';
import { CampaignEditModal } from '@/components/campaigns/CampaignEditModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { formatMoney } from '@/lib/utils/currency';

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

  // Only Meta deploys exist in this phase, so we only need to know whether
  // Meta itself is connected — checked here (rather than disabling the button
  // after a failed attempt) so the user sees why before they click it.
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
            { label: 'Total Budget', value: formatMoney(campaign.budget_total, currencyCode) },
            { label: 'Daily Budget', value: formatMoney(campaign.budget_daily, currencyCode) },
            { label: 'Start Date', value: campaign.start_date || '—' },
            { label: 'End Date', value: campaign.end_date || 'Ongoing' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </Card>

        {campaign.platform === 'meta' && (
          <Card variant="outlined" padding="lg" className="space-y-3">
            <h3 className="font-semibold text-gray-900">Meta Deployment</h3>
            {campaign.platform_status === 'deployed' ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge tone="success">Deployed</Badge>
                  <span className="text-xs text-gray-400">
                    {campaign.platform_deployed_at
                      ? new Date(campaign.platform_deployed_at).toLocaleString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Created as <span className="font-mono text-gray-700">{campaign.platform_id}</span> on Meta,
                  paused. Activate it in Meta Ads Manager (or here, via the Activate button) when it's ready to spend.
                </p>
                <div className="text-xs text-gray-400 border-t border-gray-100 pt-2">
                  {campaign.last_synced_at
                    ? `Performance last synced ${new Date(campaign.last_synced_at).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}`
                    : 'Performance never synced yet — use Sync Performance above.'}
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
              </>
            ) : campaign.platform_status === 'failed' ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge tone="danger">Deploy failed</Badge>
                </div>
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{campaign.platform_error || 'Something went wrong deploying to Meta.'}</span>
                </div>
                {canEdit && metaConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Rocket className="w-4 h-4" />}
                    loading={deployMutation.isPending}
                    onClick={() => deployMutation.mutate()}
                  >
                    Retry deploy
                  </Button>
                )}
              </>
            ) : (
              <>
                <Badge tone="neutral">Not deployed</Badge>
                <p className="text-sm text-gray-500">
                  {metaConnected
                    ? 'This campaign only exists in Camparc so far. Deploy it to create the matching campaign on your connected Meta ad account (paused, ready to activate).'
                    : 'Connect a Meta ad account in Settings → Integrations, then deploy this campaign to push it live.'}
                </p>
              </>
            )}
          </Card>
        )}

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
