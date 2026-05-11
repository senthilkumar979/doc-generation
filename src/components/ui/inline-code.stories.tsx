import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { InlineCode } from "./inline-code";
import { Text } from "./text";

const meta = {
  title: "UI/InlineCode",
  component: InlineCode,
  tags: ["autodocs"],
} satisfies Meta<typeof InlineCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "20250511153000_api_keys.sql" } };

export const InParagraph: StoryObj = {
  render: () => (
    <Text>
      Paste <InlineCode>X-Docrail-Audit-ID</InlineCode> on callbacks to correlate renders with ingestion logs.
    </Text>
  ),
};
