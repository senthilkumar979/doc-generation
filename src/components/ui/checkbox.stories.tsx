import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };

export const Paired: StoryObj = {
  render: () => (
    <div className="flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4">
      <Checkbox id="record" defaultChecked />
      <div className="grid gap-1">
        <Label htmlFor="record" className="text-foreground">
          Retain lineage for every render
        </Label>
        <p className="text-xs text-muted-foreground">Finance templates require immutable proof chains.</p>
      </div>
    </div>
  ),
};
