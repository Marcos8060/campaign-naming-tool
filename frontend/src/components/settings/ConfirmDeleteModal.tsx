import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface ConfirmDeleteModalProps {
  member: TeamMember;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function ConfirmDeleteModal({ member, onConfirm, onCancel, isPending }: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} loading={isPending}>Remove member</Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
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
    </Modal>
  );
}
