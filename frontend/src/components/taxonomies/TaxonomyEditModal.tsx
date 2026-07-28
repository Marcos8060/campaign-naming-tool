import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Combobox } from '@/components/ui/Combobox';
import { slugifyCategory } from '@/lib/utils/taxonomy';

export interface TaxonomyNodeData {
  id: string;
  name: string;
  code: string;
  type: string;
  parent_id?: string;
  children?: TaxonomyNodeData[];
}

// Exported so taxonomies/page.tsx's "Category" dropdown can reuse the same
// list instead of referencing an undefined `TYPES` (it previously did — this
// was a pre-existing bug: the dropdown crashed on render before this fix).
// Note: still called TYPES / `type` internally (matches the DB column and
// API field) — only the user-facing label was renamed to "Category". See
// docs note in taxonomies/page.tsx for why the two names now differ.
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
  // Categories are user-defined now — this workspace's existing categories
  // (plus the original defaults, so a fresh workspace still has sensible
  // suggestions) populate the Combobox below. It still accepts any typed
  // value; slugifyCategory() normalizes it to a valid category on save.
  const categoryOptions = Array.from(new Set([...TYPES, ...allTaxonomies.map((t) => t.type)])).sort();

  const handleSave = () => {
    const type = slugifyCategory(form.type) || form.type;
    onSave({ ...form, type, parent_id: form.parent_id || undefined });
  };

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
            onClick={handleSave}
            disabled={!form.name || !form.code || !form.type.trim() || isPending}
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
            {allTaxonomies.filter((t) => t.id !== node.id).map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  );
}
