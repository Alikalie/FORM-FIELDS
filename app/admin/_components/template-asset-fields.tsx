"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const allowedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const maximumSize = 25 * 1024 * 1024;

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
    if (!allowedTypes.has(file.type)) {
      setStatus("Select a PDF, DOCX, XLSX, PPTX, JPEG, PNG, or WebP file.");
      return;
    }
    if (file.size > maximumSize) {
      setStatus("Files must be 25 MB or smaller.");
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
    const { error } = await supabase.storage
      .from("template-assets")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      setStatus(`Upload failed: ${error.message}`);
      return;
    }

    if (kind === "files") setFilePath(path);
    else setPreviewPath(path);
    setStatus("Upload complete. Save the template to keep this asset attached.");
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
      <p className="admin-form-help">{filePath ? `File attached: ${filePath.split("/").at(-1)}` : "No downloadable file attached."}</p>
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
      <p className="admin-form-help">{previewPath ? `Preview attached: ${previewPath.split("/").at(-1)}` : "No preview image attached."}</p>
      {status && <p className="admin-form-help" role="status">{status}</p>}
    </fieldset>
  );
}
