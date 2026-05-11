"use client";

import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { upsertOrgBrandProfileSectionAction } from "@/actions/upsert-org-brand-profile";
import { notify } from "@/lib/toast";
import {
  BRAND_IMAGE_ACCEPT_ATTR,
  BRAND_IMAGE_MAX_MB,
  validateBrandImageFileForUpload,
} from "@/lib/branding/brand-image-accept";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";

interface BrandingMediaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: { logoUrl: string; iconUrl: string };
}

export function BrandingMediaDrawer({ open, onOpenChange, values }: BrandingMediaDrawerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoRev, setLogoRev] = useState(0);
  const [iconRev, setIconRev] = useState(0);

  useEffect(() => {
    if (!open) return;
    setLogoRev((r) => r + 1);
    setIconRev((r) => r + 1);
  }, [open, values.logoUrl, values.iconUrl]);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    formData.set("section", "media");
    try {
      const result = await upsertOrgBrandProfileSectionAction(undefined, formData);
      if ("error" in result) {
        notify.error("Could not save logo or icon", { description: result.error });
        setError(result.error);
        return;
      }
      notify.success("Core media updated", { description: "Logo and icon saved." });
      router.refresh();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const busy = saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto rounded-2xl border-border/75 p-0 sm:max-w-3xl">
        <div className="relative border-b border-border/60 bg-muted/[0.35] px-6 py-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" aria-hidden />
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">Brand logo & icon</DialogTitle>
            <DialogDescription className="text-[0.8125rem] leading-relaxed">
              Upload JPEG, JPG, PNG, or SVG images (max {BRAND_IMAGE_MAX_MB} MB each). Choosing a file shows a preview; click Save to upload.
              Leaving a slot unchanged keeps the current asset.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="relative px-6 py-6">
          <form action={onSubmit} className="space-y-6">
            <div className="flex flex-wrap gap-8">
              <UploadSlot
                resetKey={logoRev}
                label="Logo"
                inputName="logoFile"
                previewUrl={values.logoUrl.trim() ? values.logoUrl : undefined}
              />
              <UploadSlot
                resetKey={iconRev}
                label="Icon"
                inputName="iconFile"
                previewUrl={values.iconUrl.trim() ? values.iconUrl : undefined}
              />
            </div>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter className="border-t border-border/60 pt-4 sm:justify-end">
              <Button variant="outline" type="button" className="rounded-lg" disabled={busy} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-lg font-semibold shadow-sm" disabled={busy}>
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="size-4 text-primary-foreground" label="Saving" />
                    Saving…
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
          {busy ? (
            <div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm"
              role="progressbar"
              aria-label="Saving to storage"
            >
              <Spinner className="size-10 text-accent" label="Saving" />
              <Text className="text-sm text-muted-foreground">Saving to storage…</Text>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface UploadSlotProps {
  resetKey: number;
  label: string;
  inputName: string;
  previewUrl?: string;
}

function UploadSlot({ resetKey, label, inputName, previewUrl }: UploadSlotProps) {
  const [pickError, setPickError] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ src: string; name: string } | null>(null);

  useEffect(() => {
    setPickError(null);
    setPicked((prev) => {
      if (prev?.src.startsWith("blob:")) URL.revokeObjectURL(prev.src);
      return null;
    });
  }, [resetKey]);

  useEffect(
    () => () => {
      if (picked?.src.startsWith("blob:")) URL.revokeObjectURL(picked.src);
    },
    [picked?.src],
  );

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setPickError(null);
    const file = event.target.files?.[0];
    if (!file) {
      setPicked((prev) => {
        if (prev?.src.startsWith("blob:")) URL.revokeObjectURL(prev.src);
        return null;
      });
      return;
    }
    const invalid = validateBrandImageFileForUpload(file);
    if (invalid) {
      notify.error("Invalid image", { description: invalid });
      setPickError(invalid);
      event.target.value = "";
      setPicked((prev) => {
        if (prev?.src.startsWith("blob:")) URL.revokeObjectURL(prev.src);
        return null;
      });
      return;
    }

    const src = URL.createObjectURL(file);
    setPicked((prev) => {
      if (prev?.src.startsWith("blob:")) URL.revokeObjectURL(prev.src);
      return { src, name: file.name };
    });
  }

  const displaySrc = picked?.src ?? previewUrl;

  return (
    <div className="space-y-3">
      <Label htmlFor={`${inputName}-${resetKey}`} className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </Label>
      <div className="flex min-h-[136px] w-full max-w-xs flex-col items-start gap-3 rounded-xl border border-dashed border-border/90 bg-muted/[0.25] p-4 shadow-inner ring-1 ring-black/[0.04] dark:ring-white/[0.05]">
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displaySrc} alt={`Selected ${label}`} className="max-h-24 max-w-full rounded object-contain" />
        ) : (
          <span className="text-sm text-muted-foreground">No {label.toLowerCase()} yet</span>
        )}
        {picked?.name ? <Text className="text-xs text-foreground">{picked.name}</Text> : null}
        <input
          id={`${inputName}-${resetKey}`}
          key={`${inputName}-${resetKey}`}
          name={inputName}
          type="file"
          accept={BRAND_IMAGE_ACCEPT_ATTR}
          className="max-w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          onChange={onFileChange}
        />
        {pickError ? (
          <Text className="text-xs text-destructive" role="alert">
            {pickError}
          </Text>
        ) : picked ? (
          <Text className="text-xs text-muted-foreground">Preview ready — click Save to upload.</Text>
        ) : null}
      </div>
    </div>
  );
}
