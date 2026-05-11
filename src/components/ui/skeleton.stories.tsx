import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Skeleton } from "./skeleton";

const meta = {
  title: "UI/Skeleton",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const Rows: StoryObj = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-6 w-[55%]" />
      <Skeleton className="h-4 w-[88%]" />
      <Skeleton className="h-4 w-[72%]" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="size-14 rounded-xl" />
        <div className="flex flex-1 flex-col justify-center gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-[80%]" />
        </div>
      </div>
    </div>
  ),
};
