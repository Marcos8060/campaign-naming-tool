import { AlertTriangle } from 'lucide-react';
import type { TaxonomyNodeData } from './TaxonomyEditModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface TaxonomyDeleteModalProps {
  node: TaxonomyNodeData;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function TaxonomyDeleteModal({ node, onConfirm, onCancel, isPending }: TaxonomyDeleteModalProps) {
  return (
    <Modal
      isOpen
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} loading={isPending}>Delete</Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Delete taxonomy node</h3>
          <p className="text-sm text-gray-500">
            Delete <span className="font-medium text-gray-800">{node.name}</span>?
            Child nodes will also be affected. This cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
}
