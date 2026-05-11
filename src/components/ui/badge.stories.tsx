import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Provisioning" } };
export const Outline: Story = { args: { variant: "outline", children: "Draft" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Internal" } };
export const Success: Story = { args: { variant: "success", children: "Active" } };
export const Warning: Story = { args: { variant: "warning", children: "Review" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Denied" } };
export const Info: Story = { args: { variant: "info", children: "Read-only" } };
export const Accent: Story = { args: { variant: "accent", children: "New" } };
export const Group: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="success">Synced</Badge>
      <Badge variant="warning">Policy</Badge>
      <Badge variant="secondary">SOC2</Badge>
    </div>
  ),
};
