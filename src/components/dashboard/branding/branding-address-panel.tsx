"use client";

import { MapPin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteOrgBrandAddressAction } from "@/actions/upsert-org-brand-address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { OrgBrandAddressRow } from "@/lib/branding/org-brand-schema";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";

import { BrandingAddressesDialog } from "./branding-addresses-dialog";

interface BrandingAddressPanelProps {
  addresses: OrgBrandAddressRow[];
}

export function BrandingAddressPanel({ addresses }: BrandingAddressPanelProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<OrgBrandAddressRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const formData = new FormData();
    formData.set("id", id);
    const result = await deleteOrgBrandAddressAction(undefined, formData);
    setDeletingId(null);
    if ("error" in result) {
      notify.error("Could not remove address", { description: result.error });
      setError(result.error);
      return;
    }
    notify.success("Address removed");
    router.refresh();
  }

  return (
    <div className="col-span-full lg:col-span-2">
      <Card
        className={cn(
          "relative overflow-hidden rounded-2xl border-border/70 bg-card/80 shadow-[0_28px_70px_-42px_rgb(37_99_235_/_34%),inset_0_1px_0_rgb(255_255_255_/_12%)] ring-1 ring-black/[0.035] backdrop-blur-[2px] dark:bg-card/65 dark:ring-white/[0.05]",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden />
        <CardHeader className="flex-row flex-wrap items-start gap-4 border-b border-border/60 pb-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/[0.2] to-accent/[0.05] text-accent shadow-inner ring-1 ring-accent/20">
            <MapPin className="size-[1.35rem]" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="text-[1.0625rem] font-semibold tracking-tight">Addresses</CardTitle>
              <Badge variant={addresses.length > 0 ? "success" : "secondary"} className="normal-case tabular-nums tracking-normal">
                {addresses.length} saved
              </Badge>
            </div>
            <CardDescription className="text-[0.8125rem] leading-relaxed">
              Structured locations for invoicing, legal notices, and region-specific disclosures.
            </CardDescription>
          </div>
          <Button
            variant="default"
            size="sm"
            className="ml-auto shrink-0 rounded-lg font-medium shadow-sm"
            onClick={() => {
              setAddressToEdit(null);
              setOpenDialog(true);
            }}
          >
            <Plus className="mr-1.5 size-4 opacity-90" aria-hidden />
            Add address
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {error ? (
            <Text className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
              {error}
            </Text>
          ) : null}
          {addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/[0.35] px-5 py-12 text-center">
              <MapPin className="mx-auto size-10 text-muted-foreground/55" aria-hidden />
              <p className="mt-3 text-sm italic text-muted-foreground">No postal addresses yet. Add one to unlock invoice and legal presets.</p>
            </div>
          ) : null}
          {addresses.map((address) => (
            <div
              key={address.id}
              className="relative rounded-xl border border-border/65 bg-muted/[0.2] p-5 shadow-inner ring-1 ring-black/[0.03] dark:bg-muted/10 dark:ring-white/[0.04]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-foreground">{address.label || "Untitled address"}</span>
                    {address.is_primary ? (
                      <Badge variant="outline" className="border-primary/35 text-[0.65rem] text-primary normal-case tracking-wide">
                        Primary
                      </Badge>
                    ) : null}
                  </div>
                  <div className="text-sm leading-relaxed text-muted-foreground">
                    {[address.address_line1, address.city, address.region, address.country].filter(Boolean).join(", ") || "—"}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    className="rounded-md"
                    onClick={() => {
                      setAddressToEdit(address);
                      setOpenDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="xs" variant="destructive" className="rounded-md" disabled={deletingId === address.id} onClick={() => void onDelete(address.id)}>
                    {deletingId === address.id ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <BrandingAddressesDialog
        open={openDialog}
        onOpenChange={(next) => {
          setOpenDialog(next);
          if (!next) setAddressToEdit(null);
        }}
        addresses={addresses}
        seedEditAddressId={addressToEdit?.id ?? null}
      />
    </div>
  );
}
