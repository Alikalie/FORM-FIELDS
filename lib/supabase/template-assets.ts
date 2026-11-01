export const LEGACY_TEMPLATE_ASSETS_BUCKET = "template-assets";
export const TEMPLATE_FILES_BUCKET = "template-files";
export const TEMPLATE_PREVIEWS_BUCKET = "template-previews";

export type TemplateAssetLocation = {
  bucket: string;
  path: string;
};

export function getTemplateAssetLocation(value: string): TemplateAssetLocation {
  for (const bucket of [TEMPLATE_FILES_BUCKET, TEMPLATE_PREVIEWS_BUCKET] as const) {
    const prefix = `${bucket}:`;
    if (value.startsWith(prefix)) {
      return { bucket, path: value.slice(prefix.length) };
    }
  }
  return { bucket: LEGACY_TEMPLATE_ASSETS_BUCKET, path: value };
}

export function isMissingTemplateAssetColumns(error: { code?: string; message: string }) {
  return /\b(?:file_path|preview_image_path)\b/i.test(error.message) &&
    (error.code === "42703" ||
      error.code === "PGRST204" ||
      /does not exist|schema cache|could not find/i.test(error.message));
}
