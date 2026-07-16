import type { Meta, StoryObj } from '@storybook/nextjs';
import { Select } from './Select';

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = (
  <>
    <option value="">All Platforms</option>
    <option value="meta">Meta</option>
    <option value="google_ads">Google Ads</option>
  </>
);

export const Default: Story = { args: { children: options } };
export const Small: Story = { args: { uiSize: 'sm', children: options } };
