import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  const account = await getAuthenticatedProfile();
  if (!account || !account.isActive) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", "/downloads/free-worksheet");
    return NextResponse.redirect(loginUrl);
  }

  const { data: template, error: templateError } = await account.supabase
    .from("templates")
    .select("id, is_free, price, is_published")
    .eq("slug", "one-page-idea-worksheet")
    .maybeSingle();
  if (templateError) throw new Error(`Unable to verify the worksheet listing: ${templateError.message}`);
  if (!template || !template.is_published || !(template.is_free || Number(template.price ?? 0) === 0)) {
    return NextResponse.json({ error: "The free worksheet is not currently available." }, { status: 404 });
  }

  const filePath = join(process.cwd(), "downloads", "one-page-idea-worksheet.html");
  const file = await readFile(filePath);
  const { error: claimError } = await account.supabase.rpc("claim_free_template_download", {
    p_template_id: template.id,
  });
  if (claimError) {
    if (
      claimError.code === "PGRST202" ||
      /could not find the function|function .* does not exist|schema cache/i.test(claimError.message)
    ) {
      return NextResponse.json(
        { error: "Free downloads are not configured yet. Apply the admin/download database migration." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: claimError.message }, { status: 403 });
  }

  return new NextResponse(file, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": 'attachment; filename="one-page-idea-worksheet.html"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
