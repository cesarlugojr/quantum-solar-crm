import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'CRM/UI/Button',
  component: Button,
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
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon']
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Add Lead',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete Lead',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'View Details',
    variant: 'outline',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const CRMActions: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Button variant="default">Add Lead</Button>
      <Button variant="outline">View Details</Button>
      <Button variant="secondary">Edit</Button>
      <Button variant="destructive" size="sm">Delete</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common button combinations used in the CRM interface.',
      },
    },
  },
};