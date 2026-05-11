import type { SupabaseClient } from "@supabase/supabase-js";

import { validateBrandImageFileForUpload, resolveBrandImageContentType } from "@/lib/branding/brand-image-accept";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/** Must match migration `storage.buckets` id. */
export const ORG_BRAND_ASSETS_BUCKET = "org-brand-assets";

/** Public object URL segment after bucket name */
const PUBLIC_MARKER = `/storage/v1/object/public/${ORG_BRAND_ASSETS_BUCKET}/`;

function extensionFromMime(mime: string): string | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/svg+xml") return "svg";
  return null;
}

/** Returns storage object path `{org_id}/brand/...` when URL is ours. */
export function objectPathFromOurPublicUrl(publicUrl: string): string | null {
  const env = getSupabasePublicEnv();
  if (!env) return null;
  const base = env.url.replace(/\/$/, "");
  if (!publicUrl.startsWith(base)) return null;
  const idx = publicUrl.indexOf(PUBLIC_MARKER);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + PUBLIC_MARKER.length));
}

export async function deleteStoredObjectAtPath(client: SupabaseClient, path: string): Promise<void> {
  await client.storage.from(ORG_BRAND_ASSETS_BUCKET).remove([path]);
}

export async function deleteStoredAssetIfOwned(
  client: SupabaseClient,
  publicUrl: string | null | undefined,
): Promise<void> {
  if (!publicUrl?.trim()) return;
  const path = objectPathFromOurPublicUrl(publicUrl.trim());
  if (!path) return;
  await deleteStoredObjectAtPath(client, path);
}

async function deletePrefixFiles(client: SupabaseClient, dirPath: string, namePrefix: string) {
  const { data } = await client.storage.from(ORG_BRAND_ASSETS_BUCKET).list(dirPath, { limit: 100 });
  for (const f of data ?? []) {
    if (f.name.startsWith(namePrefix)) {
      await client.storage.from(ORG_BRAND_ASSETS_BUCKET).remove([`${dirPath}/${f.name}`]);
    }
  }
}

export async function replaceLogo(client: SupabaseClient, orgId: string, file: File): Promise<{ publicUrl: string } | { error: string }> {
  const err = validateImageFile(file);
  if (err) return { error: err };

  const contentType = resolveBrandImageContentType(file);
  if (!contentType) return { error: "Unsupported image type." };
  const ext = extensionFromMime(contentType);
  if (!ext) return { error: "Unsupported image type." };

  const dir = `${orgId}/brand`;
  await deletePrefixFiles(client, dir, "logo.");
  const path = `${dir}/logo.${ext}`;
  return uploadBlobAtPath(client, path, file, contentType);
}

export async function replaceIcon(client: SupabaseClient, orgId: string, file: File): Promise<{ publicUrl: string } | { error: string }> {
  const err = validateImageFile(file);
  if (err) return { error: err };

  const contentType = resolveBrandImageContentType(file);
  if (!contentType) return { error: "Unsupported image type." };
  const ext = extensionFromMime(contentType);
  if (!ext) return { error: "Unsupported image type." };

  const dir = `${orgId}/brand`;
  await deletePrefixFiles(client, dir, "icon.");
  const path = `${dir}/icon.${ext}`;
  return uploadBlobAtPath(client, path, file, contentType);
}

export async function replaceAdditionalBrandImage(
  client: SupabaseClient,
  orgId: string,
  imageRowId: string,
  file: File,
): Promise<{ publicUrl: string } | { error: string }> {
  const err = validateImageFile(file);
  if (err) return { error: err };

  const contentType = resolveBrandImageContentType(file);
  if (!contentType) return { error: "Unsupported image type." };
  const ext = extensionFromMime(contentType);
  if (!ext) return { error: "Unsupported image type." };

  const path = `${orgId}/brand/additional/${imageRowId}.${ext}`;
  return uploadBlobAtPath(client, path, file, contentType);
}

async function uploadBlobAtPath(
  client: SupabaseClient,
  path: string,
  file: File,
  contentType: string,
): Promise<{ publicUrl: string } | { error: string }> {
  const { error } = await client.storage
    .from(ORG_BRAND_ASSETS_BUCKET)
    .upload(path, file, { contentType, upsert: true });
  if (error) return { error: error.message };

  const { data } = client.storage.from(ORG_BRAND_ASSETS_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}

function validateImageFile(file: File): string | null {
  return validateBrandImageFileForUpload(file);
}
