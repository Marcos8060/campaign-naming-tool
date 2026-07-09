'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePatch, usePost } from '@/lib/hooks/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const COLOR_FIELDS = [
  { key: 'primary_color', label: 'Primary Color' },
  { key: 'secondary_color', label: 'Secondary Color' },
  { key: 'accent_color', label: 'Accent Color' },
  { key: 'danger_color', label: 'Danger Color' },
  { key: 'success_color', label: 'Success Color' },
  { key: 'warning_color', label: 'Warning Color' },
  { key: 'background_primary', label: 'Background' },
  { key: 'text_primary', label: 'Text Color' },
  { key: 'border_color', label: 'Border Color' },
];

function ThemePreview({ colors, logoUrl }: { colors: Record<string, string>; logoUrl?: string }) {
  const primary = colors.primary_color || '#3b82f6';
  const secondary = colors.secondary_color || '#8b5cf6';
  const accent = colors.accent_color || '#06b6d4';
  const success = colors.success_color || '#22c55e';
  const danger = colors.danger_color || '#ef4444';
  const bg = colors.background_primary || '#ffffff';
  const text = colors.text_primary || '#111827';
  const border = colors.border_color || '#e5e7eb';

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: border, backgroundColor: bg, color: text }}>
      {/* Mock sidebar */}
      <div className="flex" style={{ minHeight: '200px' }}>
        <div className="w-28 flex-shrink-0 p-3 space-y-1" style={{ backgroundColor: primary + '18', borderRight: `1px solid ${border}` }}>
          {logoUrl ? (
            <img src={`http://localhost:8000${logoUrl}`} alt="Logo" className="h-5 mb-3 object-contain" />
          ) : (
            <div className="text-xs font-bold mb-3" style={{ color: primary }}>Camparc</div>
          )}
          {['Dashboard', 'Campaigns', 'Analytics', 'Settings'].map((item, i) => (
            <div
              key={item}
              className="text-xs px-2 py-1.5 rounded"
              style={{
                backgroundColor: i === 0 ? primary : 'transparent',
                color: i === 0 ? '#fff' : text + 'aa',
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Mock content */}
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold" style={{ color: text }}>Dashboard</div>
            <div className="text-xs px-2.5 py-1 rounded-lg text-white" style={{ backgroundColor: primary }}>
              + New Campaign
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Campaigns', val: '24', color: primary },
              { label: 'Budget', val: '$12K', color: secondary },
              { label: 'ROAS', val: '3.4x', color: success },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-lg p-2.5" style={{ border: `1px solid ${border}` }}>
                <div className="text-xs" style={{ color: text + '88' }}>{label}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Mock table row */}
          <div className="rounded-lg p-2" style={{ border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 py-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: success }} />
              <div className="text-xs flex-1" style={{ color: text }}>NIKE_AJ1_NA_AWARE_BF24</div>
              <div className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: accent + '22', color: accent }}>Meta</div>
            </div>
            <div className="flex items-center gap-2 py-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: danger }} />
              <div className="text-xs flex-1" style={{ color: text }}>BRAND_SPRING_EU_CONV</div>
              <div className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: secondary + '22', color: secondary }}>Google</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemePage() {
  const router = useRouter();
  const { isAdmin } = useRole();
  const queryClient = useQueryClient();
  const [colors, setColors] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!isAdmin) router.replace('/dashboard');
  }, [isAdmin, router]);

  const { data: branding } = useGet({ url: '/branding' });

  useEffect(() => {
    if (branding) {
      setColors(branding);
      setLogoUrl(branding.logo_url);
    }
  }, [branding]);

  const updateMutation = usePatch({
    url: '/branding',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branding', 'workspace'] });
      toast.success('Theme saved');
    },
    onError: () => toast.error('Failed to save theme'),
  });

  const uploadLogoMutation = usePost<{ logo_url?: string }, { file: File; type: 'light' | 'dark' }>({
    url: ({ type }) => `/branding/logo?logo_type=${type}`,
    body: ({ file }: { file: File; type: 'light' | 'dark' }) => {
      const formData = new FormData();
      formData.append('file', file);
      return formData;
    },
    onSuccess: (data, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['branding'] });
      if (type === 'light' && data.logo_url) setLogoUrl(data.logo_url);
      toast.success(`${type === 'light' ? 'Logo' : 'Dark logo'} uploaded`);
    },
    onError: () => toast.error('Upload failed'),
  });

  const uploadLogo = (file: File, type: 'light' | 'dark') => uploadLogoMutation.mutate({ file, type });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Theme & Branding</h1>
        <p className="text-gray-500 mt-1">Customize your workspace appearance</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: controls */}
        <div className="col-span-3 space-y-6">
          {/* Logo */}
          <Card variant="outlined" padding="lg" className="space-y-4">
            <h3 className="font-semibold text-gray-900">Logo</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'light' as const, label: 'Logo (Light Mode)', urlKey: 'logo_url' },
                { type: 'dark' as const, label: 'Logo (Dark Mode)', urlKey: 'logo_dark_url' },
              ].map(({ type, label, urlKey }) => (
                <div key={type}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  {branding?.[urlKey] && (
                    <img
                      src={`http://localhost:8000${branding[urlKey]}`}
                      alt="Logo preview"
                      className="h-10 mb-2 object-contain"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], type)}
                    className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-soft file:text-primary hover:file:bg-primary-soft"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Colors */}
          <Card variant="outlined" padding="lg" className="space-y-4">
            <h3 className="font-semibold text-gray-900">Brand Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors[key] || '#3b82f6'}
                    onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                    <p className="text-xs text-gray-400 font-mono">{colors[key] || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button loading={updateMutation.isPending} onClick={() => updateMutation.mutate(colors)}>
              Save Theme
            </Button>
          </Card>
        </div>

        {/* Right: live preview */}
        <div className="col-span-2">
          <div className="sticky top-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</span>
            </div>
            <ThemePreview colors={colors} logoUrl={logoUrl} />
            <p className="text-xs text-gray-400 text-center">Preview updates as you change colors</p>
          </div>
        </div>
      </div>
    </div>
  );
}
