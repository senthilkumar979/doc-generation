"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createTemplateAction } from "@/actions/create-template";
import { notify } from "@/lib/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TEMPLATE_TYPES } from "@/lib/templates/constants";

export function TemplateComposer() {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof TEMPLATE_TYPES)[number]>("letter");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError(null);
    const fd = new FormData(form);
    const result = await createTemplateAction(undefined, fd);
    setPending(false);
    if (result.error) {
      notify.error("Could not create template", { description: result.error });
      setError(result.error);
      return;
    }
    notify.success("Template created");
    form.reset();
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New template</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="template_type" value={kind} />
          <div className="grid gap-2">
            <Label htmlFor="tpl-name">Name</Label>
            <Input id="tpl-name" name="name" required minLength={1} maxLength={120} placeholder="Customer letter" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tpl-type">Type</Label>
            <Select
              value={kind}
              onValueChange={(v) => setKind(v as (typeof TEMPLATE_TYPES)[number])}
            >
              <SelectTrigger id="tpl-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">Letter (PDF preview)</SelectItem>
                <SelectItem value="blank">Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {kind === "letter" ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="tpl-subject">Subject</Label>
                <Input id="tpl-subject" name="subject" required minLength={1} maxLength={200} placeholder="Statement" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tpl-body">Body</Label>
                <Textarea id="tpl-body" name="content" required minLength={1} maxLength={20000} rows={5} />
              </div>
            </>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Create template"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
