"use client";

import type { Meta, StoryObj } from "@storybook/react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta = {
  title: "UI/Select",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const TenantScope: StoryObj = {
  render: () => (
    <Select defaultValue="finance">
      <SelectTrigger className="w-[220px]" aria-label="Billing scope">
        <SelectValue placeholder="Choose scope" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Business unit</SelectLabel>
          <SelectItem value="finance">Finance HQ</SelectItem>
          <SelectItem value="ops">Global ops</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Jurisdiction</SelectLabel>
          <SelectItem value="eu">EU data boundary</SelectItem>
          <SelectItem value="us">US regulated</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};
