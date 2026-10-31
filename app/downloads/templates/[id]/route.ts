import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTemplateAssetColumns } from "@/lib/supabase/template-assets";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await getAuthenticatedProfile();
  if (!account || !account.isActive) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { id } = await params;
  const { data: template, error } = await account.supabase
    .from("templates")
    .select("id, title, is_published, file_path")
    .eq("id", id)
    .maybeSingle();

  if (error && isMissingTemplateAssetColumns(error)) {
    return NextResponse.json(
      { error: "Secure downloads are not configured yet. Apply the admin/download database migration." },
      { status: 503 },
    );
  }
  if (error) throw new Error(`Unable to verify download: ${error.message}`);
  if (!template || !template.is_published || !template.file_path) {
    return NextResponse.json({ error: "This template has no available download." }, { status: 404 });
  }

  const fileExtension = template.file_path.split(".").at(-1)?.toLowerCase();
  const downloadName = `${template.title.replace(/[^a-zA-Z0-9._-]+/g, "-")}${fileExtension ? `.${fileExtension}` : ""}`;
  const adminClient = createAdminClient();
  const { data: signedFile, error: signingError } = await adminClient.storage
    .from("template-assets")
    .createSignedUrl(template.file_path, 60, {
      download: downloadName,
    });

  if (signingError || !signedFile) {
    throw new Error(`Unable to create a secure download link: ${signingError?.message ?? "No signed URL returned."}`);
  }

  const { error: recordError } = await account.supabase.rpc("record_template_download", {
    p_template_id: id,
  });

  if (recordError) {
    if (
      recordError.code === "PGRST202" ||
      /could not find the function|function .* does not exist|schema cache/i.test(recordError.message)
    ) {
      return NextResponse.json(
        { error: "Download access is not configured yet. Apply the admin/download database migration." },
        { status: 503 },
      );
    }
    const message = recordError.message.includes("three free")
      ? "Your three free template downloads have been used."
      : recordError.message;
    return NextResponse.json({ error: message }, { status: 403 });
  }

  return NextResponse.redirect(signedFile.signedUrl, 303);
}
