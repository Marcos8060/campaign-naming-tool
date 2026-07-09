import type { Meta, StoryObj } from '@storybook/nextjs';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Label' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { tone: 'neutral', children: 'viewer' } };
export const Primary: Story = { args: { tone: 'primary', children: 'manager' } };
export const Success: Story = { args: { tone: 'success', children: 'active' } };
export const Danger: Story = { args: { tone: 'danger', children: 'failed' } };
export const Warning: Story = { args: { tone: 'warning', children: 'pending' } };
