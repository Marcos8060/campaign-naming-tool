'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Upload, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/lib/hooks/useRole';

export default function AssetsPage() {
  const router = useRouter();
  const { isViewer } = useRole();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isViewer) router.replace('/dashboard');
  }, [isViewer, router]);

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/assets');
      return data;
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await apiClient.post('/assets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Library</h1>
          <p className="text-gray-500 mt-1">Manage creative assets for your campaigns</p>
        </div>
        <label className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-sm hover:bg-blue-700 cursor-pointer transition-colors ${uploading ? 'opacity-50' : ''}`}>
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Asset'}
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : assets?.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No assets yet. Upload your first creative.</p>
        </div>
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
