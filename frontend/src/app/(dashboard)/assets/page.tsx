'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost } from '@/lib/hooks/api';
import { Upload, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/lib/hooks/useRole';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function AssetsPage() {
  const router = useRouter();
  const { isViewer, isReady } = useRole();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isReady && isViewer) router.replace('/dashboard');
  }, [isReady, isViewer, router]);

  const { data: assets, isLoading } = useGet({ url: '/assets' });

  const uploadMutation = usePost<unknown, File>({
    url: '/assets/upload',
    body: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return formData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset uploaded');
    },
    onError: () => toast.error('Upload failed'),
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Library</h1>
          <p className="text-gray-500 mt-1">Manage creative assets for your campaigns</p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          loading={uploadMutation.isPending}
          icon={<Upload className="w-4 h-4" />}
          className="px-4 py-2"
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload Asset'}
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploadMutation.isPending}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : assets?.length === 0 ? (
        <Card variant="outlined" padding="lg" className="border-2 border-dashed border-gray-300 text-center py-12">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No assets yet. Upload your first creative.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {assets?.map((asset: any) => (
            <div key={asset.id} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
              {asset.file_type?.startsWith('image/') ? (
                <img
                  src={`http://localhost:8000${asset.public_url}`}
                  alt={asset.file_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Image className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs truncate">{asset.file_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
