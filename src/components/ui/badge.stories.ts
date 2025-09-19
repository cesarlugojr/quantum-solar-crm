import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'CRM/UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    chromatic: {
      viewports: [320, 1200],
      delay: 300
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline']
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'New Lead',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Qualified',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Disqualified',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'In Progress',
    variant: 'outline',
  },
};

// Multiple badges removed for now - will add in proper TSX story later