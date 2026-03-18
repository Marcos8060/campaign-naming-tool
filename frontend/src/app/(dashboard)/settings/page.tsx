'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useRole } from '@/lib/hooks/useRole';
import { UserPlus, Trash2, Shield, AlertTriangle, X } from 'lucide-react';
import { AxiosError } from 'axios';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface InviteForm {
  email: string;
  name: string;
  role: string;
}

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

function ConfirmDeleteModal({
  member,
  onConfirm,
  onCancel,
  isPending,
}: {
  member: TeamMember;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Remove team member</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to remove{' '}
              <span className="font-medium text-gray-800">{member.name}</span>{' '}
              (<span className="font-mono text-xs">{member.email}</span>) from the workspace?
              They will immediately lose access.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Removing…' : 'Remove member'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isAdmin } = useRole();

  const [wsName, setWsName] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState<InviteForm>({ email: '', name: '', role: 'viewer' });
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  const { data: workspace } = useQuery({
    queryKey: ['workspace', 'current'],
    queryFn: async () => {
      const { data } = await apiClient.get('/workspaces/current');
      setWsName(data.name || '');
      return data;
    },
  });

  const { data: users } = useQuery<TeamMember[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users');
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: { name: string }) => apiClient.patch('/workspaces/current', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      toast.success('Workspace updated');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (body: InviteForm) => apiClient.post('/users/invite', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowInvite(false);
      setInvite({ email: '', name: '', role: 'viewer' });
      toast.success('Team member invited');
    },
    onError: (err: unknown) => {
      const detail = err instanceof AxiosError ? err.response?.data?.detail : undefined;
      toast.error(detail || 'Invite failed');
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiClient.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
      toast.success('Member removed');
    },
    onError: () => toast.error('Failed to remove member'),
  });

  return (
    <>
      {deleteTarget && (
        <ConfirmDeleteModal
          member={deleteTarget}
          onConfirm={() => removeMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          isPending={removeMutation.isPending}
        />
      )}

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
            Slug:{' '}
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{workspace?.slug}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => updateMutation.mutate({ name: wsName })}
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-[#2e6be4] text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* Team Management */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Team Members</h3>
            {isAdmin && (
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2e6be4] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
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
                    {['admin', 'manager', 'viewer'].map((r) => (
                      <option key={r} value={r} className="capitalize">
                        {r}
                      </option>
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
                  className="px-4 py-2 bg-[#2e6be4] text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {inviteMutation.isPending ? 'Sending…' : 'Send Invite'}
                </button>
                <button
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {users?.map((u: TeamMember) => (
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
                      {['admin', 'manager', 'viewer'].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[u.role] || ''}`}
                    >
                      {u.role}
                      {u.id === user?.id && ' (you)'}
                    </span>
                  )}
                  {isAdmin && u.id !== user?.id && (
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove member"
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
            {isAdmin && (
              <Link href="/settings/theme"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">Theme & Branding</p>
                  <p className="text-xs text-gray-500">Customize colors, logo, and favicon</p>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
            )}
            <Link href="/settings/platforms"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">Platform Configurations</p>
                <p className="text-xs text-gray-500">Naming templates per ad platform</p>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
