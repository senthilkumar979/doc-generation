import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: "Acme Ledger template" } };
export const Disabled: Story = { args: { placeholder: "Read-only slug", disabled: true, defaultValue: "acme-fin-2026" } };
export const Password: Story = { args: { type: "password", placeholder: "••••••••" } };
