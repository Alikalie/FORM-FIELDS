import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSiteContent(
  supabase: SupabaseClient,
  section: string,
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("site_content")
    .select("content_key, content")
    .eq("section", section)
    .limit(100);

  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") {
      console.warn(
        `Site content is unavailable for "${section}" because public.site_content has not been created. Apply the admin management migration to enable editable site content.`,
      );
      return {};
    }
    throw new Error(`Unable to load ${section} site content: ${error.message}`);
  }
  return Object.fromEntries((data ?? []).map(({ content_key, content }) => [content_key, content]));
}

export async function getPageContent(supabase: SupabaseClient, page: string): Promise<{
  eyebrow?: string;
  title?: string;
  description?: string;
  heading?: string;
  body?: string;
  items?: string;
}> {
  const content = await getSiteContent(supabase, "pages");
  return {
    eyebrow: content[`${page}.eyebrow`],
    title: content[`${page}.title`],
    description: content[`${page}.description`],
    heading: content[`${page}.heading`],
    body: content[`${page}.body`],
    items: content[`${page}.items`],
  };
}

export function getSafeSocialUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function ContentParagraphs({ value, className }: { value: string; className?: string }) {
  return (
    <div className={className}>
      {value.split(/\r?\n/).map((line, index) => line.trim() && <p key={`${index}-${line}`}>{line}</p>)}
    </div>
  );
}
