'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGet, usePost } from '@/lib/hooks/api';
import { Download, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/lib/hooks/useRole';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

const PLATFORMS = [
  { id: 'meta', label: 'Meta' },
  { id: 'google_ads', label: 'Google Ads' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'dv360', label: 'DV360' },
  { id: 'linkedin', label: 'LinkedIn' },
];

const FORMAT_DESCRIPTIONS: Record<string, string> = {
  generic: 'Standard CSV with all Camparc fields',
  platform_native: 'Formatted for direct platform upload (Meta Ads Manager, Google Ads Editor, etc.)',
};

export default function ExportsPage() {
  const router = useRouter();
  const { isViewer } = useRole();
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [format, setFormat] = useState<'generic' | 'platform_native'>('generic');

  useEffect(() => {
    if (isViewer) router.replace('/dashboard');
  }, [isViewer, router]);

  const { data: history, refetch } = useGet({ url: '/exports' });

  const exportMutation = usePost<Blob, { platform: string; fmt: string }>({
    url: '/exports/csv',
    body: ({ platform, fmt }: { platform: string; fmt: string }) => {
      const body: Record<string, string> = { format: fmt };
      if (platform) body.platform = platform;
      return body;
    },
    responseType: 'blob',
    onSuccess: (blob, { platform, fmt }) => {
      const suffix = fmt === 'platform_native' ? '_native' : '';
      const filename = `campaigns_${platform || 'all'}${suffix}.csv`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
      refetch();
    },
    onError: () => toast.error('Export failed'),
  });

  const canUseNativeFormat = !!selectedPlatform;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exports</h1>
        <p className="text-gray-500 mt-1">Download platform-specific campaign files for upload or reporting</p>
      </div>

      <Card variant="outlined" padding="lg" className="space-y-5">
        <h3 className="font-semibold text-gray-900">Export Campaigns</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <Select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                if (!e.target.value) setFormat('generic');
              }}
            >
              <option value="">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <Select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              disabled={!canUseNativeFormat}
            >
              <option value="generic">Generic CSV</option>
              <option value="platform_native" disabled={!canUseNativeFormat}>Platform Native Format</option>
            </Select>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
          <span>{FORMAT_DESCRIPTIONS[format]}</span>
        </div>

        {format === 'platform_native' && selectedPlatform && (
          <div className="bg-blue-50 border border-primary/20 rounded-lg p-3 text-xs text-primary">
            <strong>
              {PLATFORMS.find((p) => p.id === selectedPlatform)?.label} native format
            </strong>{' '}
            — columns are mapped to match the platform's bulk upload template. Ready for direct import.
          </div>
        )}

        <Button
          onClick={() => exportMutation.mutate({ platform: selectedPlatform, fmt: format })}
          loading={exportMutation.isPending}
          icon={<Download className="w-4 h-4" />}
          className="px-5 py-2.5"
        >
          {exportMutation.isPending ? 'Exporting…' : 'Download CSV'}
        </Button>
      </Card>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Quick Export by Platform</h3>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              onClick={() => exportMutation.mutate({ platform: p.id, fmt: 'platform_native' })}
              disabled={exportMutation.isPending}
              className="block w-full rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all group h-auto"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-gray-900">{p.label}</span>
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-gray-500 font-normal">Native format</p>
            </Button>
          ))}
        </div>
      </div>

      <Card variant="outlined" padding="none">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Export History</h3>
        </div>
        {!history?.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No exports yet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Type', 'Platform', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((exp: any) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 uppercase">
                    {exp.type === 'csv_platform_native' ? 'Native CSV' : 'CSV'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                    {exp.platform?.replace('_', ' ') || 'All'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={exp.status === 'completed' ? 'success' : 'warning'}>{exp.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(exp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
