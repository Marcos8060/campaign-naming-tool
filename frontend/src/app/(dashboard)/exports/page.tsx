'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Download, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';

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
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [format, setFormat] = useState<'generic' | 'platform_native'>('generic');

  const { data: history, refetch } = useQuery({
    queryKey: ['exports'],
    queryFn: async () => {
      const { data } = await apiClient.get('/exports');
      return data;
    },
  });

  const exportMutation = useMutation({
    mutationFn: async ({ platform, fmt }: { platform: string; fmt: string }) => {
      const body: any = { format: fmt };
      if (platform) body.platform = platform;
      const response = await apiClient.post('/exports/csv', body, { responseType: 'blob' });
      const suffix = fmt === 'platform_native' ? '_native' : '';
      const filename = `campaigns_${platform || 'all'}${suffix}.csv`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
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

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="font-semibold text-gray-900">Export Campaigns</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                if (!e.target.value) setFormat('generic');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              disabled={!canUseNativeFormat}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="generic">Generic CSV</option>
              <option value="platform_native" disabled={!canUseNativeFormat}>Platform Native Format</option>
            </select>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
          <span>{FORMAT_DESCRIPTIONS[format]}</span>
        </div>

        {format === 'platform_native' && selectedPlatform && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            <strong>
              {PLATFORMS.find((p) => p.id === selectedPlatform)?.label} native format
            </strong>{' '}
            — columns are mapped to match the platform's bulk upload template. Ready for direct import.
          </div>
        )}

        <button
          onClick={() => exportMutation.mutate({ platform: selectedPlatform, fmt: format })}
          disabled={exportMutation.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {exportMutation.isPending ? 'Exporting…' : 'Download CSV'}
        </button>
      </div>

      {/* Quick export cards */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Quick Export by Platform</h3>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => exportMutation.mutate({ platform: p.id, fmt: 'platform_native' })}
              disabled={exportMutation.isPending}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-gray-900">{p.label}</span>
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-xs text-gray-500">Native format</p>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200">
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
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                      ${exp.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(exp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
