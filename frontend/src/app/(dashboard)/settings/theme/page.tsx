'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost } from '@/lib/hooks/api';
import { API_ORIGIN } from '@/lib/api/request';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function ThemePage() {
  const router = useRouter();
  const { isAdmin, isReady } = useRole();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isReady && !isAdmin) router.replace('/dashboard');
  }, [isReady, isAdmin, router]);

  const { data: branding } = useGet({ url: '/branding' });

  // Colors, the light/dark logo split, and the live-preview mockup were
  // removed on purpose — none of them were wired up to anything real in the
  // app (see Sidebar.tsx), so keeping them just added a form nobody's
  // choices actually showed up anywhere. This page does one thing: your
  // logo, which the sidebar now genuinely renders. More can come back here
  // later if a real need for it shows up.
  const uploadLogoMutation = usePost<{ url?: string }, { file: File }>({
    url: '/branding/logo?logo_type=light',
    body: ({ file }: { file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return formData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branding'] });
      toast.success('Logo uploaded');
    },
    onError: () => toast.error('Upload failed'),
  });

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
        <p className="text-gray-500 mt-1">Set the logo shown in your workspace's sidebar</p>
      </div>

      <Card variant="outlined" padding="lg" className="space-y-4">
        <h3 className="font-semibold text-gray-900">Logo</h3>
        {branding?.logo_url && (
          <img
            src={`${API_ORIGIN}${branding.logo_url}`}
            alt="Current logo"
            className="h-10 object-contain"
          />
        )}
        <Input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={(e) => e.target.files?.[0] && uploadLogoMutation.mutate({ file: e.target.files[0] })}
          className="border-0 p-0 focus:ring-0 text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-soft file:text-primary hover:file:bg-primary-soft"
        />
        <p className="text-xs text-gray-400">PNG, JPG, or SVG. Shows up in the sidebar in place of the default mark.</p>
      </Card>
    </div>
  );
}
