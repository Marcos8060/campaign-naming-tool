import type { Meta, StoryObj } from '@storybook/nextjs';
import { Input } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'e.g. North America' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { uiSize: 'sm' } };
export const Disabled: Story = { args: { disabled: true, value: 'Locked value' } };
export const WithError: Story = { args: { className: 'border-red-400 focus:ring-red-400' } };
