"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createOrganizationAction } from "@/actions/create-organization";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { isNextRedirectError } from "@/lib/next/is-next-redirect-error";

const schema = z.object({
  name: z.string().min(2, "Use at least 2 characters.").max(120),
});

type Schema = z.infer<typeof schema>;

export function OnboardingForm() {
  const [fatal, setFatal] = useState<string | null>(null);
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: Schema) {
    setFatal(null);
    const fd = new FormData();
    fd.set("name", values.name);

    try {
      const result = await createOrganizationAction(undefined, fd);
      if (result?.error) {
        setFatal(result.error);
      }
    } catch (err) {
      if (isNextRedirectError(err)) throw err;
      setFatal(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const busy = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization name</FormLabel>
              <FormControl>
                <Input autoComplete="organization" placeholder="Finance operations" {...field} />
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
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            <>
              <Spinner />
              Saving…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </Form>
  );
}
