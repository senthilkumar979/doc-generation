import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = { args: { className: "max-w-xs" } };

export const Vertical: StoryObj = {
  render: () => (
    <div className="flex h-24 items-stretch gap-4">
      <div className="text-sm text-muted-foreground">Finance</div>
      <Separator orientation="vertical" />
      <div className="text-sm text-muted-foreground">Operations</div>
    </div>
  ),
};
