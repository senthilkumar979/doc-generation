"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "./button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";

const schema = z.object({
  workspace: z.string().min(2, "Name is short for audit logs."),
  notifier: z.string().email(),
});

type Schema = z.infer<typeof schema>;

const meta = {
  title: "UI/Form",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const ReactHookForm: StoryObj = {
  render: function FormDemo() {
    const form = useForm<Schema>({
      resolver: zodResolver(schema),
      defaultValues: { workspace: "", notifier: "" },
      mode: "onBlur",
    });

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => {
            /* Storybook demo: validation-only */
          })}
          className="grid w-full max-w-md gap-5"
        >
          <FormField
            control={form.control}
            name="workspace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace label</FormLabel>
                <FormControl>
                  <Input placeholder="SEC filings — Q1" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>Shown on invoices and render receipts.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ops email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="alerts@acme.example" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" className="w-fit">
            Validate
          </Button>
        </form>
      </Form>
    );
  },
};
