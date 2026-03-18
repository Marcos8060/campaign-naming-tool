import { useState } from 'react';
import { X } from 'lucide-react';

export interface TaxonomyNodeData {
  id: string;
  name: string;
  code: string;
  type: string;
  parent_id?: string;
  children?: TaxonomyNodeData[];
}

const TYPES = ['brand', 'product', 'region', 'objective', 'promotion', 'custom'];

interface TaxonomyEditModalProps {
  node: TaxonomyNodeData;
  allTaxonomies: TaxonomyNodeData[];
  onClose: () => void;
  onSave: (data: Omit<TaxonomyNodeData, 'id' | 'children'>) => void;
  isPending: boolean;
}

export function TaxonomyEditModal({ node, allTaxonomies, onClose, onSave, isPending }: TaxonomyEditModalProps) {
  const [form, setForm] = useState({
    name: node.name,
    code: node.code,
    type: node.type,
    parent_id: node.parent_id || '',
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Edit Taxonomy</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent (optional)</label>
            <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No parent (root)</option>
              {allTaxonomies.filter((t) => t.id !== node.id).map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave({ ...form, parent_id: form.parent_id || undefined })}
            disabled={!form.name || !form.code || isPending}
            className="px-4 py-2 bg-[#2e6be4] text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
