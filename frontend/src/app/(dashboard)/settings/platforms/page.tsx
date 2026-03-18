'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

const PLATFORMS = ['meta', 'google_ads', 'tiktok', 'dv360', 'linkedin'];

export default function PlatformsSettingsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ naming_template: '', separator: '_', max_length: 255 });

  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data } = await apiClient.get('/platforms');
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (body: any) => apiClient.post('/platforms', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      setEditing(null);
      toast.success('Platform config saved');
    },
  });

  const startEdit = (platform: any) => {
    setEditing(platform.platform);
    setForm({
      naming_template: platform.naming_template || '',
      separator: platform.separator || '_',
      max_length: platform.max_length || 255,
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Configurations</h1>
        <p className="text-gray-500 mt-1">Configure naming templates for each ad platform</p>
      </div>

      <div className="space-y-4">
        {platforms?.map((p: any) => (
          <div key={p.platform} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 capitalize">{p.platform.replace('_', ' ')}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active || p.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.is_active || p.id ? 'Configured' : 'Default'}
                </span>
              </div>
              <button
                onClick={() => editing === p.platform ? setEditing(null) : startEdit(p)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {editing === p.platform ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing === p.platform ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naming Template</label>
                  <input
                    value={form.naming_template}
                    onChange={(e) => setForm({ ...form, naming_template: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="{brand}_{product}_{region}_{objective}"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use {'{variable}'} placeholders matching your taxonomy types</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
                    <input
                      value={form.separator}
                      onChange={(e) => setForm({ ...form, separator: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                    <input
                      type="number"
                      value={form.max_length}
                      onChange={(e) => setForm({ ...form, max_length: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => saveMutation.mutate({ platform: p.platform, ...form })}
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                {p.naming_template || 'Using default template'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
