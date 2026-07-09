import type { Meta, StoryObj } from '@storybook/nextjs';
import { Card } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: <p className="text-sm text-gray-600">Border-based card (settings sections, edit forms).</p>,
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: <p className="text-sm text-gray-600">Shadow-based card (dashboard KPI tiles).</p>,
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'outlined',
    padding: 'none',
    children: <div className="p-4 bg-gray-50 text-sm text-gray-500">Custom inner padding</div>,
  },
};
