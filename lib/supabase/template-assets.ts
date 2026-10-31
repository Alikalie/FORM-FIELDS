export function isMissingTemplateAssetColumns(error: { code?: string; message: string }) {
  return /\b(?:file_path|preview_image_path)\b/i.test(error.message) &&
    (error.code === "42703" ||
      error.code === "PGRST204" ||
      /does not exist|schema cache|could not find/i.test(error.message));
}
