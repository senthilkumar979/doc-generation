"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createApiKeyAction, type CreateApiKeyResult } from "@/actions/create-api-key";
import { revokeApiKeyAction } from "@/actions/revoke-api-key";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { InlineCode } from "@/components/ui/inline-code";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import { buildApiKeyColumns } from "./api-keys-columns";
import type { ApiKeyListItem } from "./api-key-types";

export type { ApiKeyListItem } from "./api-key-types";

interface ApiKeysPanelProps {
  keys: ApiKeyListItem[];
}

const createKeySchema = z.object({
  name: z.string().min(1, "Label required.").max(80),
});

type CreateKeyForm = z.infer<typeof createKeySchema>;

export function ApiKeysPanel({ keys }: ApiKeysPanelProps) {
  const [createFatal, setCreateFatal] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<CreateApiKeyResult["revealed"]>();
  const [revokeFatal, setRevokeFatal] = useState<string | null>(null);
  const [revokePending, setRevokePending] = useState<string | null>(null);

  const form = useForm<CreateKeyForm>({
    resolver: zodResolver(createKeySchema),
    defaultValues: { name: "" },
    mode: "onBlur",
  });

  const onRevoke = useCallback(async (id: string) => {
    setRevokePending(id);
    setRevokeFatal(null);
    const fd = new FormData();
    fd.set("id", id);
    const result = await revokeApiKeyAction(undefined, fd);
    setRevokePending(null);
    if (result.error) setRevokeFatal(result.error);
  }, []);

  async function onCreate(values: CreateKeyForm) {
    setCreateFatal(null);
    const fd = new FormData();
    fd.set("name", values.name);
    const result = await createApiKeyAction(undefined, fd);
    if (result.error) {
      setCreateFatal(result.error);
      return;
    }
    if (result.revealed) {
      setRevealed(result.revealed);
      form.reset({ name: "" });
    }
  }

  const columns = useMemo(
    () => buildApiKeyColumns({ onRevoke, revokePending }),
    [onRevoke, revokePending],
  );

  return (
    <div className="space-y-8">
      {revealed ? (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Copy this secret now</AlertTitle>
          <AlertDescription className="grid gap-3">
            <p>
              It won’t be shown again. Key: <span className="font-semibold text-foreground">{revealed.name}</span>
            </p>
            <InlineCode className="block whitespace-pre-wrap break-all px-3 py-2 text-xs">{revealed.plaintext}</InlineCode>
            <div>
              <Button variant="warning" size="sm" type="button" onClick={() => setRevealed(undefined)}>
                I’ve saved it
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create key</CardTitle>
          <CardDescription>Labels appear in audits; choose something your security team recognises.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreate)} className="flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="min-w-0 flex-1">
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Production PDFs"
                        autoComplete="off"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting} className="shrink-0">
                {form.formState.isSubmitting ? "Creating…" : "Generate API key"}
              </Button>
            </form>
          </Form>
          {createFatal ? <Text className="text-destructive mt-3 text-xs">{createFatal}</Text> : null}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <Heading as="h2">Your keys</Heading>
        {revokeFatal ? <Text className="text-destructive text-sm">{revokeFatal}</Text> : null}
        <DataTable columns={columns} data={keys} emptyMessage="No API keys yet." />
      </section>
    </div>
  );
}
