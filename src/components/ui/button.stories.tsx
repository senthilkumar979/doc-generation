import { Settings } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Primary action" } };
export const PrimaryDarkHover: Story = { args: { children: "Save changes", variant: "default" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Revoke access" } };
export const Outline: Story = { args: { variant: "outline", children: "Secondary" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Cancel" } };
export const Link: Story = { args: { variant: "link", children: "Documentation" } };
export const Success: Story = { args: { variant: "success", children: "Provisioned" } };
export const Warning: Story = { args: { variant: "warning", children: "Review policy" } };
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Settings">
        <Settings />
      </Button>
    </div>
  ),
};
