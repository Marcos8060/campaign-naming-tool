'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost, useDelete } from '@/lib/hooks/api';
import { toast } from 'sonner';
import { useRole } from '@/lib/hooks/useRole';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PlatformConnection {
  id: string;
  platform: string;
  status: 'pending' | 'connected' | 'expired' | 'revoked';
  external_account_id: string | null;
  external_account_name: string | null;
  token_expires_at: string | null;
}

interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  account_status: number;
  timezone_name: string;
}

const PLATFORM_META: Record<string, { label: string; desc: string; available: boolean }> = {
  meta:       { label: 'Meta',       desc: 'Facebook & Instagram ads', available: true },
  google_ads: { label: 'Google Ads', desc: 'Search, Display, Video',   available: false },
  tiktok:     { label: 'TikTok',     desc: 'Short-form video',         available: false },
  dv360:      { label: 'DV360',      desc: 'Display & Video 360',      available: false },
  linkedin:   { label: 'LinkedIn',   desc: 'Professional network',    available: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Connection was cancelled or denied.',
  invalid_state: 'That connection link expired — please try connecting again.',
  meta_api_error: 'Meta rejected the connection. Please try again.',
  no_ad_accounts: 'No ad accounts were found on that Meta login.',
};

export default function IntegrationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, isReady } = useRole();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isReady && !isAdmin) router.replace('/dashboard');
  }, [isReady, isAdmin, router]);

  const { data: connections } = useGet<PlatformConnection[]>({ url: '/integrations' });

  const connectMutation = usePost<{ authorize_url: string }, void>({
    url: '/integrations/meta/connect',
    onSuccess: (data) => {
      window.location.href = data.authorize_url;
    },
    onError: (err) => toast.error(err.message || 'Could not start the Meta connection'),
  });

  const disconnectMutation = useDelete<void, string>({
    url: (platform) => `/integrations/${platform}`,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Disconnected');
    },
    onError: () => toast.error('Failed to disconnect'),
  });

  const selectAccountFlow = searchParams.get('select_account');
  const connectionId = searchParams.get('connection_id');
  const showPicker = selectAccountFlow === 'meta' && !!connectionId;

  const { data: adAccounts } = useGet<MetaAdAccount[]>({
    url: `/integrations/meta/ad-accounts?connection_id=${connectionId}`,
    // Deliberately NOT nested under ['integrations', ...] — invalidateQueries({queryKey:
    // ['integrations']}) elsewhere on this page does a hierarchical/prefix match, so keeping
    // this key separate stops that broader refresh from refetching this picker after
    // select-account has already deleted the pending row it queries by connection_id.
    queryKey: ['meta-ad-accounts', connectionId],
    enabled: showPicker,
  });

  const selectAccountMutation = usePost<
    PlatformConnection,
    { connection_id: string; ad_account_id: string; ad_account_name: string }
  >({
    url: '/integrations/meta/select-account',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Meta ad account connected');
      router.replace('/settings/integrations');
    },
    onError: (err) => toast.error(err.message || 'Could not connect that ad account'),
  });

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected) {
      toast.success(`${PLATFORM_META[connected]?.label ?? connected} connected successfully`);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      router.replace('/settings/integrations');
    }
    if (error) {
      toast.error(ERROR_MESSAGES[error] || 'Something went wrong connecting the platform.');
      router.replace('/settings/integrations');
    }
    // Only react to the query string changing, not to the callbacks/functions above re-creating on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const getConnection = (platform: string) =>
    connections?.find((c) => c.platform === platform && c.status === 'connected');

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">
          Connect real ad accounts so Camparc can eventually push campaigns and pull real performance data.
        </p>
      </div>

      {showPicker && (
        <Card variant="outlined" padding="lg" className="space-y-3">
          <h3 className="font-semibold text-gray-900">Choose a Meta ad account</h3>
          <p className="text-sm text-gray-500">
            That Meta login has access to more than one ad account. Pick the one this workspace should use.
          </p>
          <div className="space-y-2">
            {adAccounts?.map((acct) => (
              <button
                key={acct.id}
                onClick={() =>
                  selectAccountMutation.mutate({
                    connection_id: connectionId as string,
                    ad_account_id: acct.id,
                    ad_account_name: acct.name,
                  })
                }
                disabled={selectAccountMutation.isPending}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary-soft transition-colors text-left disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{acct.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{acct.id} · {acct.currency}</p>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            ))}
            {adAccounts?.length === 0 && (
              <p className="text-sm text-gray-500">No ad accounts found on that login.</p>
            )}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {Object.entries(PLATFORM_META).map(([platform, meta]) => {
          const conn = getConnection(platform);
          return (
            <Card key={platform} variant="outlined" padding="lg">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{meta.label}</h3>
                    {conn ? (
                      <Badge tone="success">Connected</Badge>
                    ) : (
                      <Badge tone="neutral">Not connected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{meta.desc}</p>
                  {conn && (
                    <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                      {conn.external_account_name} ({conn.external_account_id})
                    </p>
                  )}
                </div>
                {conn ? (
                  <Button
                    variant="outline"
                    onClick={() => disconnectMutation.mutate(platform)}
                    loading={disconnectMutation.isPending}
                    className="flex-shrink-0"
                  >
                    Disconnect
                  </Button>
                ) : meta.available ? (
                  <Button
                    onClick={() => connectMutation.mutate()}
                    loading={connectMutation.isPending}
                    className="flex-shrink-0"
                  >
                    Connect
                  </Button>
                ) : (
                  <Button disabled variant="outline" title="Coming in a later phase" className="flex-shrink-0">
                    Coming soon
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
