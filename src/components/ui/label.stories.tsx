import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Label",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const WithInput: StoryObj = {
  render: () => (
    <div className="grid max-w-xs gap-2">
      <Label htmlFor="org">Organization slug</Label>
      <Input id="org" placeholder="finance-corp" />
    </div>
  ),
};

export const WithCheckbox: StoryObj = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="accept" />
      <Label htmlFor="accept">I agree to the data processing appendix</Label>
    </div>
  ),
};
