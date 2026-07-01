'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { CheckCircle, ChevronRight } from 'lucide-react';
import type { Taxonomy } from '@/types';
import type { PlatformConfig, CampaignFormData } from '@/types/campaign-create';
import { ValidationChecklist } from '@/components/campaigns/ValidationChecklist';
import { LivePreview } from '@/components/campaigns/LivePreview';


// ── Constants ─────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'meta',       label: 'Meta',       desc: 'Facebook & Instagram' },
  { id: 'google_ads', label: 'Google Ads', desc: 'Search, Display, Video' },
  { id: 'tiktok',     label: 'TikTok',     desc: 'Short-form video' },
  { id: 'dv360',      label: 'DV360',      desc: 'Display & Video 360' },
  { id: 'linkedin',   label: 'LinkedIn',   desc: 'Professional network' },
];

const OBJECTIVES = ['awareness', 'consideration', 'conversion', 'retention', 'traffic', 'leads'];

const STEPS = [
  { label: 'Platform',   desc: 'Choose your ad platform' },
  { label: 'Taxonomy',   desc: 'Select classification values' },
  { label: 'Details',    desc: 'Budget & schedule' },
  { label: 'Validation', desc: 'Review name & checks' },
  { label: 'Confirm',    desc: 'Create campaign' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreateCampaignPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isViewer } = useRole();

  useEffect(() => {
    if (isViewer) router.replace('/campaigns');
  }, [isViewer, router]);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CampaignFormData>({
    platform: '',
    name: '',
    objective: '',
    budget_total: '',
    budget_daily: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    taxonomy_values: {},
  });

  const { data: taxonomies = [] } = useQuery<Taxonomy[]>({
    queryKey: ['taxonomies', 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get<Taxonomy[]>('/taxonomies');
      return data;
    },
  });

  const { data: platformConfig } = useQuery<PlatformConfig | null>({
    queryKey: ['platform', form.platform],
    queryFn: async () => {
      if (!form.platform) return null;
      const { data } = await apiClient.get<PlatformConfig[]>('/platforms');
      return data.find((p) => p.platform === form.platform) ?? null;
    },
    enabled: !!form.platform,
  });

  const mutation = useMutation({
    mutationFn: (payload: Omit<CampaignFormData, 'budget_total' | 'budget_daily'> & {
      name: string;
      budget_total: number | null;
      budget_daily: number | null;
    }) => apiClient.post('/campaigns', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully!');
      router.push(`/campaigns/${res.data.id}`);
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || 'Failed to create campaign');
    },
  });

  const generatedName = useMemo(() => {
    if (!form.platform) return '';
    const sep = platformConfig?.separator ?? '_';
    const template = platformConfig?.naming_template ?? `{platform}${sep}{objective}${sep}{date}`;
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    let name = template
      .replace('{platform}', form.platform.toUpperCase())
      .replace('{objective}', form.objective?.toUpperCase() || 'GENERAL')
      .replace('{date}', dateStr);
    Object.entries(form.taxonomy_values).forEach(([k, v]) => {
      if (v) name = name.replace(`{${k}}`, v);
    });
    return name;
  }, [form.platform, form.objective, form.taxonomy_values, platformConfig]);

  const finalName = form.name || generatedName || `Campaign_${Date.now()}`;
  const maxLen = platformConfig?.max_length ?? 100;

  const validationChecks: ValidationCheck[] = useMemo(() => [
    { label: 'Platform selected',             pass: !!form.platform,                                           required: true },
    { label: 'Taxonomy values populated',     pass: Object.values(form.taxonomy_values).some(Boolean),         required: false },
    { label: 'Campaign objective set',        pass: !!form.objective,                                          required: false },
    { label: 'Name within character limit',   pass: finalName.length <= maxLen,                                required: true },
    { label: 'Name does not contain spaces',  pass: !finalName.includes(' '),                                  required: false },
    { label: 'Budget specified',              pass: !!form.budget_total,                                       required: false },
    { label: 'Start date set',               pass: !!form.start_date,                                         required: false },
  ], [form, finalName, maxLen]);

  const canAdvance = useMemo(() => {
    if (step === 1) return !!form.platform;
    if (step === 4) return validationChecks.filter((c) => c.required).every((c) => c.pass);
    return true;
  }, [step, form.platform, validationChecks]);

  const handleSubmit = () => {
    mutation.mutate({
      ...form,
      name: finalName,
      budget_total: form.budget_total ? Number(form.budget_total) : null,
      budget_daily: form.budget_daily ? Number(form.budget_daily) : null,
    });
  };

  const taxonomyTypes: string[] = Array.from(new Set(taxonomies.map((t) => t.type)));
  const showPreviewPanel = step === 2 || step === 3;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <button onClick={() => router.push('/campaigns')} className="hover:text-gray-700">Campaigns</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Create Campaign</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-start gap-0">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step > i + 1 ? 'bg-positive text-white' : step === i + 1 ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${step === i + 1 ? 'font-semibold text-primary' : step > i + 1 ? 'text-positive' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mt-[-14px] mx-1 transition-colors ${step > i + 1 ? 'bg-positive' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className={`grid gap-6 ${showPreviewPanel ? 'grid-cols-5' : 'grid-cols-1'}`}>
        <div className={showPreviewPanel ? 'col-span-3' : 'col-span-1'}>
          <div className="bg-white rounded-xl border border-gray-200 p-6">

            {/* Step 1: Platform */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">Select Platform</h2>
                  <p className="text-sm text-gray-500 mt-1">Choose the advertising platform for this campaign.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setForm({ ...form, platform: p.id })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.platform === p.id
                          ? 'border-primary bg-primary-soft shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{p.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                      {form.platform === p.id && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
                          <CheckCircle className="w-3 h-3" /> Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Taxonomy */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">Select Taxonomy Values</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    These values are inserted into your naming template. Watch the live preview update as you select.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Objective</label>
                  <select
                    value={form.objective}
                    onChange={(e) => setForm({ ...form, objective: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select objective…</option>
                    {OBJECTIVES.map((o) => (
                      <option key={o} value={o} className="capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {taxonomyTypes.length > 0 ? (
                  <div className="space-y-3">
                    {taxonomyTypes.map((type) => (
                      <div key={type}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{type}</label>
                        <select
                          value={form.taxonomy_values[type] || ''}
                          onChange={(e) =>
                            setForm({ ...form, taxonomy_values: { ...form.taxonomy_values, [type]: e.target.value } })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select {type}…</option>
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
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                    No taxonomies configured yet. You can still create a campaign — go to{' '}
                    <button className="underline font-medium" onClick={() => router.push('/taxonomies')}>
                      Taxonomies
                    </button>{' '}
                    to set them up.
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">Campaign Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Set budget, schedule, and optionally override the generated name.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name <span className="text-gray-400 font-normal">(optional — auto-generated if empty)</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={generatedName || 'Auto-generated from template'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {!form.name && generatedName && (
                    <p className="text-xs text-primary mt-1">
                      Will use: <span className="font-mono font-medium">{generatedName}</span>
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
                    <input
                      type="number" min="0" value={form.budget_total}
                      onChange={(e) => setForm({ ...form, budget_total: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget ($)</label>
                    <input
                      type="number" min="0" value={form.budget_daily}
                      onChange={(e) => setForm({ ...form, budget_daily: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Validation */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">Preview & Validation</h2>
                  <p className="text-sm text-gray-500 mt-1">Review your campaign name and confirm all checks pass before creating.</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Final Campaign Name</p>
                  <div className="bg-gray-900 text-green-400 font-mono text-sm rounded-lg px-4 py-3 break-all">
                    {finalName}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{finalName.length} characters</span>
                    <span className={finalName.length > maxLen ? 'text-red-500 font-medium' : ''}>Max: {maxLen}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Validation Checklist</p>
                  <ValidationChecklist checks={validationChecks} />
                </div>
                {validationChecks.filter((c) => c.required && !c.pass).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    Please fix the required checks above before proceeding.
                  </div>
                )}
                {validationChecks.filter((c) => c.required).every((c) => c.pass) && (
                  <div className="bg-positive-soft border border-positive/20 rounded-lg p-3 text-sm text-positive flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    All required checks passed. Ready to create!
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">Confirm & Create</h2>
                  <p className="text-sm text-gray-500 mt-1">Review your campaign summary before creating.</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                  {([
                    ['Platform',       PLATFORMS.find((p) => p.id === form.platform)?.label ?? form.platform],
                    ['Campaign Name',  finalName],
                    ['Objective',      form.objective ? form.objective.charAt(0).toUpperCase() + form.objective.slice(1) : '—'],
                    ['Total Budget',   form.budget_total ? `$${Number(form.budget_total).toLocaleString()}` : '—'],
                    ['Daily Budget',   form.budget_daily ? `$${Number(form.budget_daily).toLocaleString()}` : '—'],
                    ['Start Date',     form.start_date || '—'],
                    ['End Date',       form.end_date || '—'],
                    ['Status',         'Draft'],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="flex justify-between px-4 py-3 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900 text-right max-w-xs break-all">{value}</span>
                    </div>
                  ))}
                </div>
                {Object.entries(form.taxonomy_values).some(([, v]) => v) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Taxonomy Values</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(form.taxonomy_values)
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <div key={k} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
                            <span className="text-gray-500 capitalize">{k}:</span>{' '}
                            <span className="font-semibold text-gray-900">{String(v)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live preview panel (steps 2 & 3) */}
        {showPreviewPanel && (
          <div className="col-span-2">
            <LivePreview generatedName={generatedName} platformConfig={platformConfig} form={form} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="px-5 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 disabled:opacity-40 transition-colors text-sm font-medium"
        >
          Back
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          Step {step} of {STEPS.length}
        </div>
        {step < STEPS.length ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance}
            className="px-6 py-2 bg-primary text-white font-medium rounded-sm hover:bg-primary-hover disabled:opacity-50 transition-colors text-sm"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="px-6 py-2 bg-primary text-white font-medium rounded hover:bg-primary-hover disabled:opacity-50 transition-colors text-sm"
          >
            {mutation.isPending ? 'Creating…' : 'Create Campaign'}
          </button>
        )}
      </div>
    </div>
  );
}
