"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const schema = z
  .object({
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type Schema = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const [fatal, setFatal] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: Schema) {
    setFatal(null);
    setOk(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.updateUser({ password: values.newPassword });
      if (error) {
        setFatal(error.message);
        return;
      }
      setOk("Password updated. You remain signed in on this device.");
      form.reset({ newPassword: "", confirmPassword: "" });
    } catch (e) {
      setFatal(e instanceof Error ? e.message : "Could not update password.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 max-w-md space-y-4">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {fatal ? (
          <Alert variant="destructive">
            <AlertDescription>{fatal}</AlertDescription>
          </Alert>
        ) : null}
        {ok ? (
          <Alert variant="success">
            <AlertDescription>{ok}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Form>
  );
}
