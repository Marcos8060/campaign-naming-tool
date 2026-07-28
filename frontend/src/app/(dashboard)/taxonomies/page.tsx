'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useGet, usePost, usePatch, useDelete } from '@/lib/hooks/api';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/lib/hooks/useRole';
import { TaxonomyEditModal, TYPES, type TaxonomyNodeData } from '@/components/taxonomies/TaxonomyEditModal';
import { TaxonomyDeleteModal } from '@/components/taxonomies/TaxonomyDeleteModal';
import { TaxonomyNode } from '@/components/taxonomies/TaxonomyNode';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Combobox } from '@/components/ui/Combobox';
import { slugifyCategory } from '@/lib/utils/taxonomy';

export default function TaxonomiesPage() {
  const router = useRouter();
  const { canManage, canAdmin, isViewer, isReady } = useRole();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingNode, setEditingNode] = useState<TaxonomyNodeData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyNodeData | null>(null);
  const [form, setForm] = useState({ name: '', type: '', code: '', parent_id: '' });

  useEffect(() => {
    if (isReady && isViewer) router.replace('/dashboard');
  }, [isReady, isViewer, router]);

  const { data: tree, isLoading } = useGet<TaxonomyNodeData[]>({ url: '/taxonomies/tree' });

  const { data: allTaxonomies = [] } = useGet<TaxonomyNodeData[]>({ url: '/taxonomies' });

  // Same idea as TaxonomyEditModal: categories are user-defined now, so this
  // suggests the workspace's existing categories (plus the original
  // defaults for a fresh workspace) rather than locking the field to a
  // fixed list.
  const categoryOptions = Array.from(new Set([...TYPES, ...allTaxonomies.map((t) => t.type)])).sort();

  const createMutation = usePost<TaxonomyNodeData, Omit<TaxonomyNodeData, 'id' | 'children'>>({
    url: '/taxonomies',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomies'] });
      setShowForm(false);
      setForm({ name: '', type: '', code: '', parent_id: '' });
      toast.success('Taxonomy created');
    },
    onError: () => toast.error('Failed to create taxonomy'),
  });

  const updateMutation = usePatch<TaxonomyNodeData, Partial<TaxonomyNodeData> & { id: string }>({
    url: ({ id }) => `/taxonomies/${id}`,
    body: ({ id, ...body }: Partial<TaxonomyNodeData> & { id: string }) => body,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomies'] });
      setEditingNode(null);
      toast.success('Taxonomy updated');
    },
    onError: () => toast.error('Failed to update taxonomy'),
  });

  const deleteMutation = useDelete<void, string>({
    url: (id) => `/taxonomies/${id}`,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomies'] });
      setDeleteTarget(null);
      toast.success('Taxonomy deleted');
    },
    onError: () => toast.error('Failed to delete taxonomy'),
  });

  return (
    <>
      {editingNode && (
        <TaxonomyEditModal node={editingNode} allTaxonomies={allTaxonomies}
          onClose={() => setEditingNode(null)}
          onSave={(data) => updateMutation.mutate({ id: editingNode.id, ...data })}
          isPending={updateMutation.isPending} />
      )}

      {deleteTarget && (
        <TaxonomyDeleteModal node={deleteTarget}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteMutation.isPending} />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Taxonomies</h1>
            <p className="text-gray-500 mt-1">Define your campaign naming hierarchy</p>
          </div>
          {canManage && (
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>
              Add Taxonomy
            </Button>
          )}
        </div>

        {showForm && canManage && (
          <Card variant="outlined" padding="lg">
            <h3 className="font-semibold text-gray-900 mb-4">New Taxonomy Node</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. North America" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="font-mono"
                  placeholder="e.g. NA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Combobox
                  value={form.type}
                  onChange={(v) => setForm({ ...form, type: v })}
                  options={categoryOptions}
                  placeholder="Click to see categories, or type a new one"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent (optional)</label>
                <Select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
                  <option value="">No parent (root)</option>
                  {allTaxonomies.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => createMutation.mutate({
                  ...form,
                  type: slugifyCategory(form.type) || form.type,
                  parent_id: form.parent_id || undefined,
                })}
                disabled={!form.name || !form.code || !form.type.trim()}
                loading={createMutation.isPending}
              >
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <Card variant="outlined" padding="none">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {allTaxonomies.length} {allTaxonomies.length === 1 ? 'taxonomy' : 'taxonomies'}
            </span>
            {/* Column headers only make sense once rows have room to lay out
                as a single line (see the sm: breakpoint in TaxonomyNode) —
                hidden on mobile where rows wrap onto multiple lines instead. */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
              <span className="w-24 text-right">Code</span>
              <span className="w-20 text-right">Category</span>
              {canManage && <span className="w-16" />}
            </div>
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">Loading taxonomies…</div>
            ) : !tree?.length ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">No taxonomies yet</p>
                <p className="text-sm text-gray-400">Add taxonomy nodes to define your campaign naming structure</p>
              </div>
            ) : (
              tree.map((node) => (
                <TaxonomyNode key={node.id} node={node}
                  onEdit={setEditingNode} onDelete={setDeleteTarget}
                  canManage={canManage} canAdmin={canAdmin} />
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
