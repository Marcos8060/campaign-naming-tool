import type { Meta, StoryObj } from '@storybook/nextjs';
import { Save, Trash2 } from 'lucide-react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Button' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary', children: 'Save Changes' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Cancel' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Dismiss' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Remove member' } };
export const Text: Story = { args: { variant: 'text', children: 'Learn more' } };

export const WithIcon: Story = {
  args: { variant: 'primary', children: 'Save Changes', icon: <Save className="w-4 h-4" /> },
};

export const Loading: Story = {
  args: { variant: 'primary', children: 'Saving…', loading: true },
};

export const Disabled: Story = {
  args: { variant: 'destructive', children: 'Remove member', disabled: true, icon: <Trash2 className="w-4 h-4" /> },
};

export const Small: Story = { args: { variant: 'primary', size: 'sm', children: 'Small' } };

export const IconOnly: Story = {
  args: { variant: 'ghost', size: 'icon', children: <Trash2 className="w-4 h-4" /> },
};
