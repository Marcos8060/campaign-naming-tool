import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent (optional)</label>
          <Select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
            <option value="">No parent (root)</option>
            {allTaxonomies.filter((t) => t.id !== node.id).map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  );
}
