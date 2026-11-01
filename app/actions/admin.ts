"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile, isAdminRole } from "@/lib/supabase/auth";
import { getTemplateAssetLocation } from "@/lib/supabase/template-assets";

async function requireAdmin() {
  const account = await getAuthenticatedProfile();
  if (!account || !account.isActive || !isAdminRole(account.role)) {
    throw new Error("Administrator access is required.");
  }
  return account;
}

async function requireSuperAdmin() {
  const account = await requireAdmin();
  if (account.role !== "super_admin") {
    throw new Error("Super administrator access is required for this action.");
  }
  return account;
}

function getValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value: string) {
  return /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isMissingTemplateAssetColumns(error: { code?: string; message: string }) {
  return /\b(?:file_path|preview_image_path)\b/i.test(error.message) &&
    (error.code === "42703" ||
      error.code === "PGRST204" ||
      /does not exist|schema cache|could not find/i.test(error.message));
}

function refreshAdminAndStorefront() {
  for (const path of [
    "/admin",
    "/admin/templates",
    "/admin/categories",
    "/",
    "/templates",
    "/templates/free",
    "/templates/[slug]",
    "/categories",
    "/categories/[slug]",
  ]) {
    if (path.includes("[")) revalidatePath(path, "page");
    else revalidatePath(path);
  }
}

export async function saveTemplateAction(formData: FormData) {
  const account = await requireAdmin();
  const id = getValue(formData, "id");
  const title = getValue(formData, "title");
  const slug = slugify(getValue(formData, "slug") || title);
  const rawPrice = getValue(formData, "price");
  const price = Number(rawPrice);
  const categoryId = getValue(formData, "category_id");

  if (!title || title.length > 160 || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      !rawPrice || !Number.isFinite(price) || price < 0 || !isUuid(categoryId)) {
    throw new Error("Enter a title, valid non-negative price, and category.");
  }
  if (id && !isUuid(id)) throw new Error("A valid template id is required.");
  const currency = getValue(formData, "currency").toUpperCase() || "USD";
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Currency must be a three-letter ISO code.");

  const listingValues = {
    title,
    slug,
    short_description: getValue(formData, "short_description") || null,
    price,
    currency,
    is_free: price === 0,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
    category_id: categoryId,
  };
  const values = {
    ...listingValues,
    file_path: getValue(formData, "file_path") || null,
    preview_image_path: getValue(formData, "preview_image_path") || null,
  };

  let result = id
    ? await account.supabase.from("templates").update(values).eq("id", id).select("id").maybeSingle()
    : await account.supabase.from("templates").insert(values).select("id").maybeSingle();

  if (result.error && isMissingTemplateAssetColumns(result.error)) {
    if (values.file_path || values.preview_image_path) {
      throw new Error("Apply the admin/download migration before saving uploaded template files.");
    }
    result = id
      ? await account.supabase.from("templates").update(listingValues).eq("id", id).select("id").maybeSingle()
      : await account.supabase.from("templates").insert(listingValues).select("id").maybeSingle();
  }

  if (result.error) {
    throw new Error(`Unable to save the template: ${result.error.message}`);
  }
  if (!result.data) throw new Error("Unable to save the template: no matching template was updated.");

  refreshAdminAndStorefront();
  redirect("/admin/templates?saved=1");
}

export async function deleteTemplateAction(formData: FormData) {
  const account = await requireAdmin();
  const id = getValue(formData, "id");
  if (!isUuid(id)) throw new Error("A valid template id is required.");

  const { data: template, error: loadError } = await account.supabase
    .from("templates")
    .select("file_path, preview_image_path")
    .eq("id", id)
    .maybeSingle();
  if (loadError && !isMissingTemplateAssetColumns(loadError)) {
    throw new Error(`Unable to load template assets: ${loadError.message}`);
  }

  const { data: deleted, error } = await account.supabase.from("templates").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw new Error(`Unable to delete the template: ${error.message}`);
  if (!deleted) throw new Error("Unable to delete the template: no matching template was found.");
  refreshAdminAndStorefront();
  const assetLocations = [template?.file_path, template?.preview_image_path]
    .filter((path): path is string => Boolean(path))
    .map(getTemplateAssetLocation);
  const buckets = new Map<string, string[]>();
  for (const asset of assetLocations) {
    const paths = buckets.get(asset.bucket) ?? [];
    paths.push(asset.path);
    buckets.set(asset.bucket, paths);
  }
  for (const [bucket, paths] of buckets) {
    const { error: storageError } = await account.supabase.storage.from(bucket).remove(paths);
    if (storageError) throw new Error(`Template was deleted, but asset cleanup failed: ${storageError.message}`);
  }

  redirect("/admin/templates?deleted=1");
}

export async function saveCategoryAction(formData: FormData) {
  const account = await requireAdmin();
  const id = getValue(formData, "id");
  const name = getValue(formData, "name");
  const slug = slugify(getValue(formData, "slug") || name);

  if (!name || name.length > 100 || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Enter a category name and valid URL slug.");
  }
  if (id && !isUuid(id)) throw new Error("A valid category id is required.");
  if (getValue(formData, "image_url")) {
    try {
      const imageUrl = new URL(getValue(formData, "image_url"));
      if (imageUrl.protocol !== "https:") throw new Error("Image URL must use HTTPS.");
    } catch (error) {
      if (error instanceof Error && error.message === "Image URL must use HTTPS.") throw error;
      throw new Error("Enter a valid HTTPS image URL.");
    }
  }

  const values = {
    name,
    slug,
    description: getValue(formData, "description") || null,
    image_url: getValue(formData, "image_url") || null,
    is_active: formData.get("is_active") === "on",
  };
  const result = id
    ? await account.supabase.from("categories").update(values).eq("id", id).select("id").maybeSingle()
    : await account.supabase.from("categories").insert(values).select("id").maybeSingle();

  if (result.error) {
    throw new Error(`Unable to save the category: ${result.error.message}`);
  }
  if (!result.data) throw new Error("Unable to save the category: no matching category was updated.");

  refreshAdminAndStorefront();
  redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData) {
  const account = await requireAdmin();
  const id = getValue(formData, "id");
  if (!isUuid(id)) throw new Error("A valid category id is required.");

  const { data: deleted, error } = await account.supabase.from("categories").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw new Error(`Unable to delete the category: ${error.message}`);
  if (!deleted) throw new Error("Unable to delete the category: no matching category was found.");

  refreshAdminAndStorefront();
  redirect("/admin/categories?deleted=1");
}

export async function moderateReviewAction(formData: FormData) {
  const account = await requireAdmin();
  const id = getValue(formData, "id");
  if (!isUuid(id)) throw new Error("A valid review id is required.");
  const isPublished = formData.get("is_published") === "on";
  const { data: updated, error } = await account.supabase
    .from("reviews")
    .update({
      is_published: isPublished,
      moderated_by: account.user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Unable to moderate review: ${error.message}`);
  if (!updated) throw new Error("Unable to moderate review: no matching review was found.");
  revalidatePath("/admin/reviews");
  revalidatePath("/templates/[slug]", "page");
  redirect(`/admin/reviews?updated=${isPublished ? "published" : "unpublished"}`);
}

export async function deleteReviewAction(formData: FormData) {
  const account = await requireAdmin();
  const id = getValue(formData, "id");
  if (!isUuid(id)) throw new Error("A valid review id is required.");
  const { data: deleted, error } = await account.supabase.from("reviews").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw new Error(`Unable to delete review: ${error.message}`);
  if (!deleted) throw new Error("Unable to delete review: no matching review was found.");
  revalidatePath("/admin/reviews");
  revalidatePath("/templates/[slug]", "page");
  redirect("/admin/reviews?deleted=1");
}

export async function markContactMessageHandledAction(formData: FormData) {
  const account = await requireAdmin();
  const id = getValue(formData, "id");
  if (!isUuid(id)) throw new Error("A valid message id is required.");
  const handled = formData.get("handled") === "on";
  const { data: updated, error } = await account.supabase
    .from("contact_messages")
    .update({
      status: handled ? "handled" : "new",
      handled_by: handled ? account.user.id : null,
      handled_at: handled ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Unable to update contact message: ${error.message}`);
  if (!updated) throw new Error("Unable to update contact message: no matching message was found.");
  revalidatePath("/admin/messages");
  redirect(`/admin/messages?updated=${handled ? "handled" : "reopened"}`);
}

export async function saveSiteContentAction(formData: FormData) {
  const account = await requireAdmin();
  const id = getValue(formData, "id");
  const contentKey = getValue(formData, "content_key");
  const section = getValue(formData, "section");
  const content = getValue(formData, "content");
  if (!contentKey || !section) throw new Error("Content key and section are required.");
  if (contentKey.length > 160 || section.length > 80) throw new Error("Content key or section is too long.");
  if (id && !isUuid(id)) throw new Error("A valid content record id is required.");
  if (contentKey.startsWith("footer.social_") && content) {
    let socialUrl: URL;
    try {
      socialUrl = new URL(content);
    } catch {
      throw new Error("Social profile links must be valid HTTPS URLs.");
    }
    if (socialUrl.protocol !== "https:" || !socialUrl.hostname.includes(".")) {
      throw new Error("Social profile links must be valid HTTPS URLs.");
    }
  }

  const values = {
    content_key: contentKey,
    section,
    content,
    updated_at: new Date().toISOString(),
  };
  const result = id
    ? await account.supabase.from("site_content").update(values).eq("id", id).select("id").maybeSingle()
    : await account.supabase.from("site_content").upsert(values, { onConflict: "content_key" }).select("id").maybeSingle();
  if (result.error) throw new Error(`Unable to save site content: ${result.error.message}`);
  if (!result.data) throw new Error("Unable to save site content: no matching record was updated.");
  for (const path of [
    "/admin/content",
    "/",
    "/about",
    "/faq",
    "/terms",
    "/privacy",
    "/refund-policy",
    "/how-it-works",
    "/contact",
    "/categories",
    "/templates",
  ]) {
    revalidatePath(path);
  }
  revalidatePath("/", "layout");
  const destination = ["settings", "navigation", "pages", "footer"].includes(section)
    ? `/admin/content/${section}`
    : "/admin/content";
  redirect(`${destination}?saved=1`);
}

export async function deleteSiteContentAction(formData: FormData) {
  const account = await requireAdmin();
  const id = getValue(formData, "id");
  if (!isUuid(id)) throw new Error("A valid content id is required.");
  const { data: record, error: loadError } = await account.supabase
    .from("site_content")
    .select("section")
    .eq("id", id)
    .maybeSingle();
  if (loadError) throw new Error(`Unable to load site content: ${loadError.message}`);
  if (!record) throw new Error("Unable to delete site content: no matching record was found.");
  const { data: deleted, error } = await account.supabase.from("site_content").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw new Error(`Unable to delete site content: ${error.message}`);
  if (!deleted) throw new Error("Unable to delete site content: no matching record was found.");
  for (const path of [
    "/admin/content",
    "/",
    "/about",
    "/faq",
    "/terms",
    "/privacy",
    "/refund-policy",
    "/how-it-works",
    "/contact",
    "/categories",
    "/templates",
  ]) {
    revalidatePath(path);
  }
  revalidatePath("/", "layout");
  const destination = ["settings", "navigation", "pages", "footer"].includes(record.section)
    ? `/admin/content/${record.section}`
    : "/admin/content";
  redirect(`${destination}?deleted=1`);
}

export async function updateUserAccountAction(formData: FormData) {
  const account = await requireSuperAdmin();
  const id = getValue(formData, "id");
  const role = getValue(formData, "role");
  const isActive = formData.get("is_active") === "on";
  if (!isUuid(id)) throw new Error("A valid profile id is required.");
  if (id === account.user.id) throw new Error("You cannot change your own role or account status.");
  if (!["user", "admin", "super_admin"].includes(role)) throw new Error("Select a valid account role.");

  const { data: updated, error } = await account.supabase
    .from("profiles")
    .update({ role, is_active: isActive })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Unable to update account: ${error.message}`);
  if (!updated) throw new Error("Unable to update account: no matching profile was found.");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  redirect(`/admin/users/${id}?saved=1`);
}
