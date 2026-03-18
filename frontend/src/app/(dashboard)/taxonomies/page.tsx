'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Plus, ChevronRight, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const TYPES = ['brand', 'product', 'region', 'objective', 'promotion', 'custom'];

function EditModal({
  node,
  allTaxonomies,
  onClose,
  onSave,
  isPending,
}: {
  node: any;
  allTaxonomies: any[];
  onClose: () => void;
  onSave: (data: any) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: node.name,
    code: node.code,
    type: node.type,
    parent_id: node.parent_id || '',
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Edit Taxonomy</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent (optional)</label>
            <select
              value={form.parent_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No parent (root)</option>
              {allTaxonomies
                .filter((t) => t.id !== node.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                ))}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...form, parent_id: form.parent_id || undefined })}
            disabled={!form.name || !form.code || isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaxonomyNode({
  node,
  depth = 0,
  onEdit,
  onDelete,
}: {
  node: any;
  depth?: number;
  onEdit: (node: any) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 pr-3 hover:bg-gray-50 rounded-lg group"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {node.children?.length > 0 ? (
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 flex-shrink-0">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}
        <span className="flex-1 text-sm text-gray-900 truncate">{node.name}</span>
        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">{node.code}</span>
        <span className="text-xs text-gray-400 capitalize flex-shrink-0 w-20 text-right">{node.type}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(node)}
            className="p-1 hover:bg-blue-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {expanded &&
        node.children?.map((child: any) => (
          <TaxonomyNode key={child.id} node={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
        ))}
    </div>
  );
}

export default function TaxonomiesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingNode, setEditingNode] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', type: 'brand', code: '', parent_id: '' });

  const { data: tree, isLoading } = useQuery({
    queryKey: ['taxonomies', 'tree'],
    queryFn: async () => {
      const { data } = await apiClient.get('/taxonomies/tree');
      return data;
    },
  });

  const { data: allTaxonomies = [] } = useQuery({
    queryKey: ['taxonomies'],
    queryFn: async () => {
      const { data } = await apiClient.get('/taxonomies');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/taxonomies', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomies'] });
      setShowForm(false);
      setForm({ name: '', type: 'brand', code: '', parent_id: '' });
      toast.success('Taxonomy created');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => apiClient.patch(`/taxonomies/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomies'] });
      setEditingNode(null);
      toast.success('Taxonomy updated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/taxonomies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomies'] });
      toast.success('Taxonomy deleted');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to delete'),
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this taxonomy node? Child nodes will also be affected.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {editingNode && (
        <EditModal
          node={editingNode}
          allTaxonomies={allTaxonomies}
          onClose={() => setEditingNode(null)}
          onSave={(data) => updateMutation.mutate({ id: editingNode.id, ...data })}
          isPending={updateMutation.isPending}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taxonomies</h1>
          <p className="text-gray-500 mt-1">Define your campaign naming hierarchy</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Taxonomy
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">New Taxonomy Node</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. North America"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. NA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent (optional)</label>
              <select
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No parent (root)</option>
                {allTaxonomies?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate({ ...form, parent_id: form.parent_id || undefined })}
              disabled={!form.name || !form.code || createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {allTaxonomies.length} {allTaxonomies.length === 1 ? 'taxonomy' : 'taxonomies'}
          </span>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="w-24 text-right">Code</span>
            <span className="w-20 text-right">Type</span>
            <span className="w-16" />
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
            tree.map((node: any) => (
              <TaxonomyNode
                key={node.id}
                node={node}
                onEdit={setEditingNode}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
