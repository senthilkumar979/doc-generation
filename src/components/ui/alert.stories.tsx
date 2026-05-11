import { AlertTriangle, BadgeCheck } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";

import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "UI/Alert",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTriangle />
      <AlertTitle>Compliance reminder</AlertTitle>
      <AlertDescription>Publishing externally requires CFO approval recorded in DocRail.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert variant="success" className="max-w-md">
      <BadgeCheck />
      <AlertTitle>Migrations applied</AlertTitle>
      <AlertDescription>Your workspace is synced with billing and render queues.</AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning" className="max-w-md">
      <AlertTriangle />
      <AlertTitle>Copy this secret once</AlertTitle>
      <AlertDescription>After closing this banner the raw key remains hashed only.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="max-w-md">
      <AlertTriangle />
      <AlertTitle>Billing paused</AlertTitle>
      <AlertDescription>Add a verified payment method to resume renders.</AlertDescription>
    </Alert>
  ),
};

export const Info: Story = {
  render: () => (
    <Alert variant="info" className="max-w-md">
      <BadgeCheck />
      <AlertTitle>Observability</AlertTitle>
      <AlertDescription>Watermark PDFs inherit org retention policy from SSO groups.</AlertDescription>
    </Alert>
  ),
};
