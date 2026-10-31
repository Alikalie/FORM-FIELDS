"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getTemplateReturnPath(formData: FormData, fallback: string) {
  const returnTo = getValue(formData, "return_to");
  if (
    !returnTo.startsWith("/") ||
    returnTo.startsWith("//") ||
    returnTo.includes("\\") ||
    /[\u0000-\u001f]/.test(returnTo)
  ) {
    return fallback;
  }

  const destination = new URL(returnTo, "https://template-marketplace.invalid");
  if (
    destination.origin !== "https://template-marketplace.invalid" ||
    (destination.pathname !== "/templates" && !destination.pathname.startsWith("/templates/"))
  ) {
    return fallback;
  }

  return `${destination.pathname}${destination.search}`;
}

export async function saveFavoriteAction(formData: FormData) {
  const account = await getAuthenticatedProfile();
  if (!account || !account.isActive) {
    redirect("/login");
  }

  const templateId = getValue(formData, "template_id");
  if (!/^[\da-f-]{36}$/i.test(templateId)) {
    throw new Error("A valid template id is required.");
  }

  const { data: template, error: templateError } = await account.supabase
    .from("templates")
    .select("id, slug")
    .eq("id", templateId)
    .eq("is_published", true)
    .maybeSingle();
  if (templateError) throw new Error(`Unable to verify this template: ${templateError.message}`);
  if (!template) throw new Error("This template is not available to save.");

  const { data: favorite, error: favoriteError } = await account.supabase
    .from("favorites")
    .select("id")
    .eq("user_id", account.user.id)
    .eq("template_id", template.id)
    .maybeSingle();
  if (favoriteError) throw new Error(`Unable to check your saved templates: ${favoriteError.message}`);

  if (!favorite) {
    const { error } = await account.supabase.from("favorites").insert({
      user_id: account.user.id,
      template_id: template.id,
    });
    if (error && error.code !== "23505") {
      throw new Error(`Unable to save this template: ${error.message}`);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/favorites");
  revalidatePath("/templates");
  redirect(getTemplateReturnPath(formData, `/templates/${template.slug}?favorite=saved`));
}

export async function removeFavoriteAction(formData: FormData) {
  const account = await getAuthenticatedProfile();
  if (!account || !account.isActive) {
    redirect("/login");
  }

  const favoriteId = getValue(formData, "favorite_id");
  if (!/^[\da-f-]{36}$/i.test(favoriteId)) {
    throw new Error("A valid favorite id is required.");
  }

  const { error } = await account.supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId)
    .eq("user_id", account.user.id);
  if (error) throw new Error(`Unable to remove this favorite: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/favorites");
  revalidatePath("/templates");
  redirect(getTemplateReturnPath(formData, "/dashboard/favorites"));
}

type ReviewActionState = {
  status: "success" | "error";
  message: string;
};

export async function submitReviewAction(
  _previousState: ReviewActionState | null,
  formData: FormData,
): Promise<ReviewActionState> {
  const account = await getAuthenticatedProfile();
  if (!account || !account.isActive) {
    return { status: "error", message: "Sign in with an active account to leave a review." };
  }

  const templateId = getValue(formData, "template_id");
  if (!/^[\da-f-]{36}$/i.test(templateId)) {
    return { status: "error", message: "A valid template is required." };
  }

  const ratingValue = getValue(formData, "rating");
  const rating = Number(ratingValue);
  if (!/^[1-5]$/.test(ratingValue) || !Number.isInteger(rating)) {
    return { status: "error", message: "Choose a rating from 1 to 5 stars." };
  }

  const body = getValue(formData, "body");
  if (body.length < 1 || body.length > 5000) {
    return { status: "error", message: "Your review must be between 1 and 5,000 characters." };
  }

  const { data: template, error: templateError } = await account.supabase
    .from("templates")
    .select("id, slug")
    .eq("id", templateId)
    .eq("is_published", true)
    .maybeSingle();
  if (templateError) throw new Error(`Unable to verify this template: ${templateError.message}`);
  if (!template) {
    return { status: "error", message: "This template is not available for review." };
  }

  const { data: purchase, error: purchaseError } = await account.supabase
    .from("purchases")
    .select("id")
    .eq("user_id", account.user.id)
    .eq("template_id", template.id)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  if (purchaseError) throw new Error(`Unable to verify your purchase: ${purchaseError.message}`);
  if (!purchase) {
    return { status: "error", message: "A completed purchase is required to review this template." };
  }

  const { data: existingReview, error: existingReviewError } = await account.supabase
    .from("reviews")
    .select("id")
    .eq("user_id", account.user.id)
    .eq("template_id", template.id)
    .maybeSingle();
  if (existingReviewError) throw new Error(`Unable to check your existing review: ${existingReviewError.message}`);
  if (existingReview) {
    return { status: "error", message: "You have already reviewed this template." };
  }

  const { error: insertError } = await account.supabase.from("reviews").insert({
    user_id: account.user.id,
    template_id: template.id,
    rating,
    body,
  });
  if (insertError?.code === "23505") {
    return { status: "error", message: "You have already reviewed this template." };
  }
  if (insertError) throw new Error(`Unable to submit your review: ${insertError.message}`);

  revalidatePath(`/templates/${template.slug}`);
  revalidatePath("/admin/reviews");
  return { status: "success", message: "Thanks! Your review was submitted for moderation." };
}
