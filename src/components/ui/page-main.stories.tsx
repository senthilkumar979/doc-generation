import type { Meta, StoryObj } from "@storybook/react";

import { Heading } from "./heading";
import { PageMain } from "./page-main";
import { Text } from "./text";

const meta = {
  title: "UI/PageMain",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const DashboardShell: StoryObj = {
  render: () => (
    <PageMain>
      <Heading as="h1">Welcome back</Heading>
      <Text muted className="mt-3 max-w-xl">
        This layout shell mirrors production dashboard padding and max widths for consistent onboarding copy blocks.
      </Text>
    </PageMain>
  ),
};
