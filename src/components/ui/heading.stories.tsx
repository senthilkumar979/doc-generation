import type { Meta, StoryObj } from "@storybook/react";

import { Heading } from "./heading";

const meta = {
  title: "UI/Heading",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const Levels: StoryObj = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <Heading as="h1">Operational dashboard</Heading>
      <Heading as="h2">Throughput controls</Heading>
      <Heading as="h3">Edge burst budget</Heading>
    </div>
  ),
};
