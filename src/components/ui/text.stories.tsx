import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Text } from "./text";

const meta = {
  title: "UI/Text",
  component: Text,
  tags: ["autodocs"],
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = {
  args: {
    children: "DocRail unifies deterministic PDF payloads with cryptographic lineage for SOC2-aligned teams.",
  },
};

export const Muted: Story = {
  args: {
    muted: true,
    children:
      "Service accounts authenticate with rotating API keys hashed with Argon2id; plaintext never touches secondary stores.",
  },
};
