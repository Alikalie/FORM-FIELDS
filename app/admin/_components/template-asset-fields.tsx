"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import {
  LEGACY_TEMPLATE_ASSETS_BUCKET,
  TEMPLATE_FILES_BUCKET,
  TEMPLATE_PREVIEWS_BUCKET,
  getTemplateAssetLocation,
} from "@/lib/supabase/template-assets";

const allowedFileTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const allowedPreviewTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const maximumFileSize = 25 * 1024 * 1024;
const maximumPreviewSize = 5 * 1024 * 1024;

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

export function TemplateAssetFields({
  filePath: initialFilePath,
  previewPath: initialPreviewPath,
}: {
  filePath?: string | null;
  previewPath?: string | null;
}) {
  const [filePath, setFilePath] = useState(initialFilePath ?? "");
  const [previewPath, setPreviewPath] = useState(initialPreviewPath ?? "");
  const [status, setStatus] = useState("");

  async function upload(file: File, kind: "files" | "previews") {
    const allowedTypes = kind === "files" ? allowedFileTypes : allowedPreviewTypes;
    const maximumSize = kind === "files" ? maximumFileSize : maximumPreviewSize;
    if (!allowedTypes.has(file.type)) {
      setStatus(kind === "files"
        ? "Select a PDF, DOCX, XLSX, or PPTX file."
        : "Select a JPEG, PNG, or WebP preview image.");
      return;
    }
    if (file.size > maximumSize) {
      setStatus(kind === "files"
        ? "Template files must be 25 MB or smaller."
        : "Preview images must be 5 MB or smaller.");
      return;
    }

    setStatus("Uploading...");
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setStatus("Sign in with an administrator account to upload assets.");
      return;
    }

    const path = `${user.id}/${kind}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const bucket = kind === "files" ? TEMPLATE_FILES_BUCKET : TEMPLATE_PREVIEWS_BUCKET;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      setStatus(`Upload failed: ${error.message}`);
      return;
    }

    if (kind === "files") setFilePath(`${bucket}:${path}`);
    else setPreviewPath(`${bucket}:${path}`);
    setStatus("Upload complete. Save the template to keep this asset attached.");
  }

  function getAssetLabel(value: string) {
    const location = getTemplateAssetLocation(value);
    return `${location.path.split("/").at(-1)}${location.bucket === LEGACY_TEMPLATE_ASSETS_BUCKET ? " (legacy private storage)" : ""}`;
  }

  return (
    <fieldset className="admin-asset-fields">
      <legend>Template files</legend>
      <label>
        Downloadable file (PDF, DOCX, XLSX, PPTX)
        <input
          accept=".pdf,.docx,.xlsx,.pptx"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file, "files");
          }}
          type="file"
        />
      </label>
      <input name="file_path" type="hidden" value={filePath} />
      <p className="admin-form-help">{filePath ? `File attached: ${getAssetLabel(filePath)}` : "No downloadable file attached."}</p>
      <label>
        Preview image (JPEG, PNG, WebP)
        <input
          accept=".jpg,.jpeg,.png,.webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file, "previews");
          }}
          type="file"
        />
      </label>
      <input name="preview_image_path" type="hidden" value={previewPath} />
      <p className="admin-form-help">{previewPath ? `Preview attached: ${getAssetLabel(previewPath)}` : "No preview image attached."}</p>
      {status && <p className="admin-form-help" role="status">{status}</p>}
    </fieldset>
  );
}
