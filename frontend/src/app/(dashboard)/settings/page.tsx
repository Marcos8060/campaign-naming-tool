'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost, usePatch, useDelete } from '@/lib/hooks/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useRole } from '@/lib/hooks/useRole';
import { UserPlus, Trash2, Shield } from 'lucide-react';
import { ConfirmDeleteModal, type TeamMember } from '@/components/settings/ConfirmDeleteModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface InviteForm {
  email: string;
  name: string;
  role: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-primary',
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
  const { isAdmin } = useRole();

  const [wsName, setWsName] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState<InviteForm>({ email: '', name: '', role: 'viewer' });
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  const { data: workspace } = useGet({ url: '/workspaces/current', queryKey: ['workspace', 'current'] });

  useEffect(() => {
    if (workspace) setWsName(workspace.name || '');
  }, [workspace]);

  const { data: users } = useGet<TeamMember[]>({ url: '/users' });

  const updateMutation = usePatch<unknown, { name: string }>({
    url: '/workspaces/current',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      toast.success('Workspace updated');
    },
  });

  const inviteMutation = usePost<unknown, InviteForm>({
    url: '/users/invite',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowInvite(false);
      setInvite({ email: '', name: '', role: 'viewer' });
      toast.success('Team member invited');
    },
    onError: (err) => toast.error(err.message || 'Invite failed'),
  });

  const roleMutation = usePatch<unknown, { id: string; role: string }>({
    url: ({ id }) => `/users/${id}/role`,
    body: ({ role }: { id: string; role: string }) => ({ role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
  });

  const removeMutation = useDelete<void, string>({
    url: (id) => `/users/${id}`,
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
        <Card variant="outlined" padding="lg" className="space-y-4">
          <h3 className="font-semibold text-gray-900">Workspace</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
            <input
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              disabled={!isAdmin}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            Slug:{' '}
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{workspace?.slug}</span>
          </div>
          {isAdmin && (
            <Button loading={updateMutation.isPending} onClick={() => updateMutation.mutate({ name: wsName })}>
              Save Changes
            </Button>
          )}
        </Card>

        {/* Team Management */}
        <Card variant="outlined" padding="none">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Team Members</h3>
            {isAdmin && (
              <Button size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowInvite(!showInvite)}>
                Invite Member
              </Button>
            )}
          </div>

          {showInvite && isAdmin && (
            <div className="px-6 py-4 bg-primary-soft border-b border-blue-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Invite Team Member</h4>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    value={invite.name}
                    onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={invite.email}
                    onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="jane@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={invite.role}
                    onChange={(e) => setInvite({ ...invite, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                <Button
                  disabled={!invite.email}
                  loading={inviteMutation.isPending}
                  onClick={() => inviteMutation.mutate(invite)}
                >
                  Send Invite
                </Button>
                <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
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
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {['admin', 'manager', 'viewer'].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge tone="neutral" className={ROLE_COLORS[u.role] || ''}>
                      {u.role}
                      {u.id === user?.id && ' (you)'}
                    </Badge>
                  )}
                  {isAdmin && u.id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Remove member"
                      onClick={() => setDeleteTarget(u)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick links */}
        <Card variant="outlined" padding="lg">
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
        </Card>
      </div>
    </>
  );
}
