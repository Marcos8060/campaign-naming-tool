'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { UserPlus, Trash2, Shield } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-700',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Full access, can manage team and billing',
  manager: 'Can create and edit campaigns, configure platforms',
  viewer: 'Read-only access to campaigns and reports',
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [wsName, setWsName] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ email: '', name: '', role: 'viewer' });

  const { data: workspace } = useQuery({
    queryKey: ['workspace', 'current'],
    queryFn: async () => {
      const { data } = await apiClient.get('/workspaces/current');
      setWsName(data.name || '');
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users');
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: any) => apiClient.patch('/workspaces/current', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      toast.success('Workspace updated');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (body: any) => apiClient.post('/users/invite', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowInvite(false);
      setInvite({ email: '', name: '', role: 'viewer' });
      toast.success('Team member invited');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Invite failed'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => apiClient.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Member removed');
    },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your workspace configuration</p>
      </div>

      {/* Workspace Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Workspace</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
          <input
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
            disabled={!isAdmin}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
        <div className="text-sm text-gray-500">
          Slug: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{workspace?.slug}</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => updateMutation.mutate({ name: wsName })}
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Team Management */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Team Members</h3>
          {isAdmin && (
            <button onClick={() => setShowInvite(!showInvite)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          )}
        </div>

        {showInvite && isAdmin && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Invite Team Member</h4>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={invite.name}
                  onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={invite.email}
                  onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jane@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={invite.role}
                  onChange={(e) => setInvite({ ...invite, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['admin', 'manager', 'viewer'].map(r => (
                    <option key={r} value={r} className="capitalize">{r}</option>
                  ))}
                </select>
              </div>
            </div>
            {invite.role && (
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {ROLE_DESCRIPTIONS[invite.role]}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => inviteMutation.mutate(invite)}
                disabled={!invite.email || inviteMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
              </button>
              <button onClick={() => setShowInvite(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {users?.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && u.id !== user?.id ? (
                  <select
                    value={u.role}
                    onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {['admin', 'manager', 'viewer'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[u.role] || ''}`}>
                    {u.role}
                    {u.id === user?.id && ' (you)'}
                  </span>
                )}
                {isAdmin && u.id !== user?.id && (
                  <button
                    onClick={() => { if (confirm(`Remove ${u.name}?`)) removeMutation.mutate(u.id); }}
                    className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Configuration</h3>
        <div className="space-y-2">
          {[
            { href: '/settings/theme', label: 'Theme & Branding', desc: 'Customize colors, logo, and favicon' },
            { href: '/settings/platforms', label: 'Platform Configurations', desc: 'Naming templates per ad platform' },
          ].map(({ href, label, desc }) => (
            <Link key={href} href={href} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
