import { AlertTriangle } from 'lucide-react';
import type { TaxonomyNodeData } from './TaxonomyEditModal';

interface TaxonomyDeleteModalProps {
  node: TaxonomyNodeData;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function TaxonomyDeleteModal({ node, onConfirm, onCancel, isPending }: TaxonomyDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
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
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
