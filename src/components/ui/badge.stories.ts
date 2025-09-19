import type { Meta, StoryObj } from '@storybook/react';
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

export const LeadStatuses: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="default">New</Badge>
      <Badge variant="secondary">Qualified</Badge>
      <Badge variant="outline">Contacted</Badge>
      <Badge variant="destructive">Disqualified</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Various badge variants used for lead statuses in the CRM system.',
      },
    },
  },
};