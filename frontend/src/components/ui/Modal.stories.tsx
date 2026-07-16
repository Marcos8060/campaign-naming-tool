import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalDemo(props: { size?: 'sm' | 'md' | 'lg' | 'xl'; danger?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-10">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={props.danger ? 'Remove team member' : 'Edit Campaign'}
        size={props.size}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant={props.danger ? 'destructive' : 'primary'} onClick={() => setOpen(false)}>
              {props.danger ? 'Remove member' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Modal body content goes here — forms, confirmations, anything the calling component needs.
        </p>
      </Modal>
    </div>
  );
}

const dummyArgs = { isOpen: true, onClose: () => {}, children: null };

export const Default: Story = {
  args: dummyArgs,
  render: () => <ModalDemo />,
};

export const Small: Story = {
  args: dummyArgs,
  render: () => <ModalDemo size="sm" danger />,
};

export const Large: Story = {
  args: dummyArgs,
  render: () => <ModalDemo size="lg" />,
};
