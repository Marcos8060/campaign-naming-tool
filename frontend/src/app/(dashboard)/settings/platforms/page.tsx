'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost } from '@/lib/hooks/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import type { Taxonomy } from '@/types';

const PLATFORMS = ['meta', 'google_ads', 'tiktok', 'dv360', 'linkedin'];

// The 3 tokens the naming engine fills from dedicated form fields (not from
// a taxonomy category) — see the generatedName logic in
// campaigns/create/page.tsx. Every other insertable token below comes from
// real taxonomy categories that exist in this workspace, so a template can
// never reference a category that doesn't exist.
const BUILTIN_TOKENS = ['platform', 'objective', 'date'];

export default function PlatformsSettingsPage() {
  const router = useRouter();
  const { isViewer, isReady } = useRole();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && isViewer) router.replace('/dashboard');
  }, [isReady, isViewer, router]);
  const [form, setForm] = useState({ naming_template: '', separator: '_', max_length: 255 });
  const templateInputRef = useRef<HTMLInputElement>(null);

  const { data: platforms } = useGet({ url: '/platforms' });
  const { data: taxonomies = [] } = useGet<Taxonomy[]>({ url: '/taxonomies' });
  const categoryTokens = Array.from(new Set(taxonomies.map((t) => t.type))).sort();

  // Inserts {token} at the cursor position instead of always appending to
  // the end — building a template is usually "put this one in the middle
  // between two I already have", not just adding to the tail.
  const insertToken = (token: string) => {
    const el = templateInputRef.current;
    const cursor = el?.selectionStart ?? form.naming_template.length;
    const next = `${form.naming_template.slice(0, cursor)}{${token}}${form.naming_template.slice(cursor)}`;
    setForm((f) => ({ ...f, naming_template: next }));
    requestAnimationFrame(() => {
      if (!el) return;
      const pos = cursor + token.length + 2; // +2 for the { }
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const saveMutation = usePost({
    url: '/platforms',
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
          <Card key={p.platform} variant="outlined" padding="sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 capitalize">{p.platform.replace('_', ' ')}</h3>
                <Badge tone={p.is_active || p.id ? 'success' : 'neutral'}>
                  {p.is_active || p.id ? 'Configured' : 'Default'}
                </Badge>
              </div>
              <Button variant="text" size="sm" onClick={() => editing === p.platform ? setEditing(null) : startEdit(p)}>
                {editing === p.platform ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            {editing === p.platform ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naming Template</label>
                  <Input
                    ref={templateInputRef}
                    value={form.naming_template}
                    onChange={(e) => setForm({ ...form, naming_template: e.target.value })}
                    className="font-mono"
                    placeholder="{brand}_{product}_{region}_{objective}"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Click a token below to insert it — building the template this way means it can never
                    reference a category that doesn&apos;t exist.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[...BUILTIN_TOKENS, ...categoryTokens].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => insertToken(t)}
                        className="px-2 py-1 rounded text-xs font-mono bg-primary-soft text-primary hover:bg-primary hover:text-white transition-colors capitalize"
                      >
                        {'{' + t + '}'}
                      </button>
                    ))}
                  </div>
                  {categoryTokens.length === 0 && (
                    <p className="text-xs text-amber-700 mt-1">
                      No taxonomy categories exist yet — only the built-in tokens above are available until you add some under Taxonomies.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
                    <Input
                      value={form.separator}
                      onChange={(e) => setForm({ ...form, separator: e.target.value })}
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                    <Input
                      type="number"
                      value={form.max_length}
                      onChange={(e) => setForm({ ...form, max_length: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate({ platform: p.platform, ...form })}>
                  Save
                </Button>
              </div>
            ) : (
              <p className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                {p.naming_template || 'Using default template'}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
