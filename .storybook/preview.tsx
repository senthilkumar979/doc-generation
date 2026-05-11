import type { Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      options: {
        surface: { name: "surface", value: "#0f172a" }
      }
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

  initialGlobals: {
    backgrounds: {
      value: "surface"
    }
  }
};

export default preview;
