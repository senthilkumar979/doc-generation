"use client";

import { GooeyToaster as GoeyToasterRoot } from "goey-toast";

import "goey-toast/styles.css";

export const GooeyToaster = () => (
  <GoeyToasterRoot
    theme="dark"
    position="bottom-right"
    closeButton
    expand
    gap={12}
    preset="smooth"
    richColors
    swipeToDismiss
    closeOnEscape
    showProgress
  />
);
