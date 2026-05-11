import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Text } from "@/components/ui/text";
import { palette } from "@/theme/palette";

const meta = {
  title: "Theme/Palette",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

function Chip({ token, hex }: { token: string; hex: string }) {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_5%)]">
      <span
        className="relative size-12 shrink-0 rounded-lg ring-2 ring-black/35 ring-offset-2 ring-offset-background"
        style={{ backgroundColor: hex }}
      />
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <span className="truncate font-mono text-xs tracking-tight text-muted-foreground">{token}</span>
        <span className="font-mono text-sm text-text-secondary">{hex}</span>
      </div>
    </div>
  );
}

function GroupTitle({ title }: { title: string }) {
  return <h4 className="mb-4 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">{title}</h4>;
}

export const BrandSurfaceText: StoryObj = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-12">
      <div>
        <GroupTitle title="Brand" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(palette.brand).map(([k, hex]) => (
            <Chip key={k} token={`brand.${k}`} hex={hex} />
          ))}
        </div>
      </div>
      <div>
        <GroupTitle title="Surface" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(palette.surface).map(([k, hex]) => (
            <Chip key={k} token={`surface.${k}`} hex={hex} />
          ))}
        </div>
      </div>
      <div>
        <GroupTitle title="Text" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(palette.text).map(([k, hex]) => (
            <Chip key={k} token={`text.${k}`} hex={hex} />
          ))}
        </div>
      </div>
      <Text muted className="text-xs">
        Values mirror <code className="text-text-secondary">src/theme/palette.ts</code> and CSS variables mapped in globals.
      </Text>
    </div>
  ),
};
