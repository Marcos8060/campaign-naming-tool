import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface TaxonomyNodeData {
  id: string;
  name: string;
  code: string;
  type: string;
  parent_id?: string;
  children?: TaxonomyNodeData[];
}

// Exported so taxonomies/page.tsx's "Type" dropdown can reuse the same list
// instead of referencing an undefined `TYPES` (it previously did — this was
// a pre-existing bug: the dropdown crashed on render before this fix).
export const TYPES = ['brand', 'product', 'region', 'objective', 'promotion', 'custom'];

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
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Taxonomy"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave({ ...form, parent_id: form.parent_id || undefined })}
            disabled={!form.name || !form.code || isPending}
            loading={isPending}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent (optional)</label>
          <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">No parent (root)</option>
            {allTaxonomies.filter((t) => t.id !== node.id).map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
