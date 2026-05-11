import type { Preview } from "@storybook/react";

import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "surface",
      values: [{ name: "surface", value: "#0f172a" }],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[240px] w-full min-w-[320px] p-6 font-sans text-foreground [&_.sb-show-main_centered]:justify-start">
        <Story />
      </div>
    ),
  ],
};

export default preview;
