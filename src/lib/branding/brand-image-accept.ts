/** Client + server: allowed branding uploads (jpeg, jpg, png, svg). */
export const BRAND_IMAGE_ACCEPT_ATTR = ".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml";

/** Must match Storage bucket limit and server validation. */
export const BRAND_IMAGE_MAX_MB = 2;
export const BRAND_IMAGE_MAX_BYTES = BRAND_IMAGE_MAX_MB * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/svg+xml"]);

const EXT = /\.(jpe?g|png|svg)$/i;

/** True when MIME is allowed or the filename matches an allowed extension. */
export function isAllowedBrandImageFile(file: File): boolean {
  if (file.type && ALLOWED_MIME.has(file.type)) return true;
  return EXT.test(file.name);
}

/** Validates type then size — use before previews and uploads. Null means OK. */
export function validateBrandImageFileForUpload(file: File): string | null {
  if (!(file instanceof File)) return "Invalid file.";
  if (file.size === 0) return "Choose a non-empty image file.";
  if (!isAllowedBrandImageFile(file) || !resolveBrandImageContentType(file)) {
    return "Upload a JPEG, JPG, PNG, or SVG image.";
  }
  if (file.size > BRAND_IMAGE_MAX_BYTES) {
    return `Image must be at most ${BRAND_IMAGE_MAX_MB} MB.`;
  }
  return null;
}

/**
 * Server Actions often deserialize file fields as `Blob`, not `instanceof File`,
 * so uploads would be skipped and URLs never updated.
 */
export function pickBrandingUploadFromFormData(entry: unknown): File | undefined {
  if (entry == null || typeof entry === "string") return undefined;
  if (typeof Blob === "undefined") return undefined;
  if (!(entry instanceof Blob) || entry.size === 0) return undefined;
  if (entry instanceof File) return entry;
  const mime = entry.type.trim();
  const filename =
    mime === "image/png"
      ? "upload.png"
      : mime === "image/jpeg" || mime === "image/jpg"
        ? "upload.jpg"
        : mime === "image/svg+xml"
          ? "upload.svg"
          : "upload.bin";
  return new File([entry], filename, { type: mime || "application/octet-stream" });
}

/** Content-Type for Storage upload (normalizes legacy `image/jpg`). */
export function resolveBrandImageContentType(file: File): string | null {
  if (file.type) {
    if (file.type === "image/jpg" || file.type === "image/jpeg") return "image/jpeg";
    if (ALLOWED_MIME.has(file.type)) return file.type;
  }
  const n = file.name.toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".svg")) return "image/svg+xml";
  return null;
}
