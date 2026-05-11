import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Text } from "./text";
import { TextLink } from "./text-link";

const meta = {
  title: "UI/TextLink",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const Accent: StoryObj = {
  render: () => (
    <Text>
      Reach the latest{" "}
      <TextLink href="/releases/changelog-example" variant="accent">
        release notes
      </TextLink>{" "}
      for migration steps.
    </Text>
  ),
};

export const MutedFooter: StoryObj = {
  render: () => (
    <div className="flex gap-6 text-xs">
      <TextLink href="/releases" variant="muted">
        Changelog
      </TextLink>
      <TextLink href="/privacy" variant="muted">
        Security addendum
      </TextLink>
    </div>
  ),
};

export const Foreground: StoryObj = {
  render: () => (
    <TextLink href="/dashboard/templates" variant="foreground">
      Resume template builder
    </TextLink>
  ),
};
