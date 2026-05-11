"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "UI/Dialog",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const Controlled: StoryObj = {
  render: function ControlledDialog() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          Open SLA dialog
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Raise retention window?</DialogTitle>
              <DialogDescription>This updates legal hold tagging for subsidiaries under your org tenant.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="button" onClick={() => setOpen(false)}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const WithTrigger: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Invite reviewer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Controlled invite</DialogTitle>
          <DialogDescription>Recipients receive SSO-only joins with watermark defaults.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" type="button">
              Later
            </Button>
          </DialogClose>
          <Button size="sm" type="button">
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
