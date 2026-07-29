'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost, useDelete } from '@/lib/hooks/api';
import { toast } from 'sonner';
import { Plus, AlertTriangle, ImageIcon, Layers, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { API_ORIGIN } from '@/lib/api/request';

interface AdSet {
  id: string;
  name: string;
  optimization_goal: string | null;
  countries: string[];
  age_min: number;
  age_max: number;
  status: 'draft' | 'deployed' | 'failed';
  platform_ad_set_id: string | null;
  platform_error: string | null;
}

interface CampaignAd {
  id: string;
  headline: string | null;
  primary_text: string | null;
  link_url: string | null;
  call_to_action: string;
  status: 'draft' | 'deployed' | 'failed';
  platform_ad_id: string | null;
  platform_error: string | null;
  asset_url: string | null;
}

interface Asset {
  id: string;
  file_name: string;
  public_url: string;
}

const CALL_TO_ACTION_TYPES = ['LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'CONTACT_US', 'DOWNLOAD', 'SUBSCRIBE'];

const STATUS_TONE: Record<string, BadgeProps['tone']> = {
  draft: 'neutral',
  deployed: 'success',
  failed: 'danger',
};

interface Props {
  campaignId: string;
  platformDeployed: boolean;
  hasCampaignBudget: boolean;
  currencyCode?: string | null;
  metaConnected: boolean;
}

export function AdSetsPanel({ campaignId, platformDeployed, hasCampaignBudget, currencyCode, metaConnected }: Props) {
  const queryClient = useQueryClient();
  const [showAdSetForm, setShowAdSetForm] = useState(false);
  const [adSetForm, setAdSetForm] = useState({ name: '', countries: 'US', age_min: '18', age_max: '65', daily_budget: '' });

  const { data: adSets = [] } = useGet<AdSet[]>({
    url: `/campaigns/${campaignId}/ad-sets`,
    queryKey: ['ad-sets', campaignId],
    enabled: platformDeployed,
  });

  const createAdSetMutation = usePost<AdSet, typeof adSetForm>({
    url: `/campaigns/${campaignId}/ad-sets`,
    body: (f: typeof adSetForm) => ({
      name: f.name || undefined,
      countries: f.countries.split(',').map((c: string) => c.trim().toUpperCase()).filter(Boolean),
      age_min: Number(f.age_min) || 18,
      age_max: Number(f.age_max) || 65,
      daily_budget: f.daily_budget || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-sets', campaignId] });
      toast.success('Ad set created on Meta — paused, ready for an ad');
      setShowAdSetForm(false);
      setAdSetForm({ name: '', countries: 'US', age_min: '18', age_max: '65', daily_budget: '' });
    },
    onError: (err) => toast.error(err.message || 'Failed to create ad set'),
  });

  if (!platformDeployed) return null;

  return (
    <Card variant="outlined" padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
          <Layers className="w-[18px] h-[18px] text-primary" />
          Ad Sets
        </h3>
        {metaConnected && (
          <Button variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdSetForm((s) => !s)}>
            {showAdSetForm ? 'Cancel' : 'Add Ad Set'}
          </Button>
        )}
      </div>

      {!metaConnected && (
        <p className="text-sm text-gray-400">Connect Meta in Settings → Integrations to add ad sets.</p>
      )}

      {showAdSetForm && (
        <div className="space-y-3 bg-gray-50 rounded-lg p-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name (optional)</label>
            <Input value={adSetForm.name} onChange={(e) => setAdSetForm({ ...adSetForm, name: e.target.value })} placeholder="Auto-named from campaign" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Countries</label>
              <Input value={adSetForm.countries} onChange={(e) => setAdSetForm({ ...adSetForm, countries: e.target.value })} placeholder="US, GB, KE" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Age min</label>
              <Input type="number" min="13" max="65" value={adSetForm.age_min} onChange={(e) => setAdSetForm({ ...adSetForm, age_min: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Age max</label>
              <Input type="number" min="13" max="65" value={adSetForm.age_max} onChange={(e) => setAdSetForm({ ...adSetForm, age_max: e.target.value })} />
            </div>
          </div>
          {!hasCampaignBudget && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Daily Budget ({currencyCode || 'USD'}) — required, this campaign has no budget of its own
              </label>
              <Input type="number" min="0" value={adSetForm.daily_budget} onChange={(e) => setAdSetForm({ ...adSetForm, daily_budget: e.target.value })} placeholder="50" />
            </div>
          )}
          <p className="text-xs text-gray-400">
            Targeting stays deliberately minimal — a country list and age range, with Meta&apos;s Advantage+ audience
            filling in the rest automatically. Created paused, same as the campaign itself.
          </p>
          <Button
            size="sm"
            loading={createAdSetMutation.isPending}
            onClick={() => createAdSetMutation.mutate(adSetForm)}
          >
            Create Ad Set
          </Button>
        </div>
      )}

      {adSets.length === 0 && !showAdSetForm && (
        <p className="text-sm text-gray-400">No ad sets yet — nothing can serve until at least one exists.</p>
      )}

      <div className="space-y-3">
        {adSets.map((adSet) => (
          <AdSetRow key={adSet.id} adSet={adSet} campaignId={campaignId} currencyCode={currencyCode} metaConnected={metaConnected} />
        ))}
      </div>
    </Card>
  );
}

function AdSetRow({
  adSet, campaignId, currencyCode, metaConnected,
}: { adSet: AdSet; campaignId: string; currencyCode?: string | null; metaConnected: boolean }) {
  const queryClient = useQueryClient();

  const deleteAdSetMutation = useDelete<void, void>({
    url: `/ad-sets/${adSet.id}`,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-sets', campaignId] });
      toast.success('Dismissed');
    },
    onError: (err) => toast.error(err.message || 'Failed to dismiss'),
  });
  const [showAdForm, setShowAdForm] = useState(false);
  const [adForm, setAdForm] = useState({ asset_id: '', headline: '', primary_text: '', link_url: '', call_to_action: 'LEARN_MORE' });

  const { data: assets = [] } = useGet<Asset[]>({ url: '/assets', enabled: showAdForm });
  const { data: ads = [] } = useGet<CampaignAd[]>({
    url: `/ad-sets/${adSet.id}/ads`,
    queryKey: ['ads', adSet.id],
    enabled: adSet.status === 'deployed',
  });

  const createAdMutation = usePost<CampaignAd, typeof adForm>({
    url: `/ad-sets/${adSet.id}/ads`,
    body: (f: typeof adForm) => f,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', adSet.id] });
      toast.success('Ad created on Meta — paused, ready to activate');
      setShowAdForm(false);
      setAdForm({ asset_id: '', headline: '', primary_text: '', link_url: '', call_to_action: 'LEARN_MORE' });
    },
    onError: (err) => toast.error(err.message || 'Failed to create ad'),
  });

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <Layers className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" title={adSet.name}>{adSet.name}</p>
            <p className="text-xs text-gray-400 truncate">
              {adSet.countries.join(', ')} · ages {adSet.age_min}–{adSet.age_max}
              {adSet.optimization_goal ? ` · optimizing for ${adSet.optimization_goal.replace(/_/g, ' ').toLowerCase()}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge tone={STATUS_TONE[adSet.status]} className="uppercase tracking-wide">{adSet.status}</Badge>
          {adSet.status === 'failed' && (
            <Button
              variant="ghost"
              size="icon"
              loading={deleteAdSetMutation.isPending}
              onClick={() => deleteAdSetMutation.mutate()}
              title="Dismiss this failed attempt"
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {adSet.status === 'failed' && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{adSet.platform_error}</span>
        </div>
      )}

      {adSet.status === 'deployed' && (
        <div className="pl-3 border-l-2 border-gray-100 space-y-2">
          {ads.map((ad) => (
            <AdRow key={ad.id} ad={ad} adSetId={adSet.id} />
          ))}

          {metaConnected && (
            <div className={ads.length > 0 ? 'pt-2 border-t border-gray-100' : undefined}>
              <Button variant="text" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAdForm((s) => !s)}>
                {showAdForm ? 'Cancel' : 'Add Ad'}
              </Button>
            </div>
          )}

          {showAdForm && (
            <div className="space-y-2 bg-gray-50 rounded-lg p-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image (from Assets)</label>
                <Select value={adForm.asset_id} onChange={(e) => setAdForm({ ...adForm, asset_id: e.target.value })}>
                  <option value="">Select an asset…</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.file_name}</option>
                  ))}
                </Select>
                {assets.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> No assets uploaded yet — add one on the Assets page first.
                  </p>
                )}
              </div>
              <Input placeholder="Headline" value={adForm.headline} onChange={(e) => setAdForm({ ...adForm, headline: e.target.value })} />
              <Input placeholder="Primary text" value={adForm.primary_text} onChange={(e) => setAdForm({ ...adForm, primary_text: e.target.value })} />
              <Input placeholder="Link URL (https://...)" value={adForm.link_url} onChange={(e) => setAdForm({ ...adForm, link_url: e.target.value })} />
              <Select value={adForm.call_to_action} onChange={(e) => setAdForm({ ...adForm, call_to_action: e.target.value })}>
                {CALL_TO_ACTION_TYPES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </Select>
              <Button
                size="sm"
                loading={createAdMutation.isPending}
                disabled={!adForm.asset_id || !adForm.headline || !adForm.primary_text || !adForm.link_url}
                onClick={() => createAdMutation.mutate(adForm)}
              >
                Create Ad
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdRow({ ad, adSetId }: { ad: CampaignAd; adSetId: string }) {
  const queryClient = useQueryClient();

  const deleteAdMutation = useDelete<void, void>({
    url: `/ad-sets/${adSetId}/ads/${ad.id}`,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', adSetId] });
      toast.success('Dismissed');
    },
    onError: (err) => toast.error(err.message || 'Failed to dismiss'),
  });

  return (
    <div className="flex items-center justify-between gap-3 text-xs bg-white border border-gray-100 rounded-lg p-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
          {ad.asset_url ? (
            <NextImage
              src={`${API_ORIGIN}${ad.asset_url}`}
              alt={ad.headline || 'Ad creative'}
              width={36}
              height={36}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-4 h-4 text-gray-300" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-800 truncate">{ad.headline}</p>
          {ad.status === 'failed' && <p className="text-red-500">{ad.platform_error}</p>}
          {ad.status === 'deployed' && <p className="text-gray-400 font-mono truncate">{ad.platform_ad_id}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge tone={STATUS_TONE[ad.status]} className="uppercase tracking-wide">{ad.status}</Badge>
        {ad.status === 'failed' && (
          <Button
            variant="ghost"
            size="icon"
            loading={deleteAdMutation.isPending}
            onClick={() => deleteAdMutation.mutate()}
            title="Dismiss this failed attempt"
            className="text-gray-400 hover:text-red-500"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
