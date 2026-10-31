import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { isMissingTemplateAssetColumns } from "@/lib/supabase/template-assets";
import { removeFavoriteAction, saveFavoriteAction } from "@/app/actions/customer";
import { PageShell } from "../../components/site-chrome";
import { ReviewForm } from "../review-form";

async function TemplateDetailContent({ slug }: { slug: string }) {
  const supabase = await createClient();
  const account = await getAuthenticatedProfile();

  const { data: template, error } = await supabase
    .from("templates")
    .select("id, title, slug, short_description, price, currency, is_free, is_published, category_id")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load the template: ${error.message}`);
  }

  if (!template) notFound();

  const { data: reviews, error: reviewsError, count: reviewCount } = await supabase
    .from("reviews")
    .select("id, rating, body, created_at", { count: "exact" })
    .eq("template_id", template.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(50);
  if (reviewsError) throw new Error(`Unable to load template reviews: ${reviewsError.message}`);

  const { data: ownReview, error: ownReviewError } = account?.isActive
    ? await supabase
        .from("reviews")
        .select("id, is_published")
        .eq("user_id", account.user.id)
        .eq("template_id", template.id)
        .maybeSingle()
    : { data: null, error: null };
  if (ownReviewError) throw new Error(`Unable to check your review: ${ownReviewError.message}`);

  const { data: purchase, error: purchaseError } = account?.isActive && !ownReview
    ? await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", account.user.id)
        .eq("template_id", template.id)
        .eq("status", "paid")
        .limit(1)
        .maybeSingle()
    : { data: null, error: null };
  if (purchaseError) throw new Error(`Unable to verify your purchase: ${purchaseError.message}`);

  const { data: favorite, error: favoriteError } = account?.isActive
    ? await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", account.user.id)
        .eq("template_id", template.id)
        .maybeSingle()
    : { data: null, error: null };
  if (favoriteError) throw new Error(`Unable to check saved templates: ${favoriteError.message}`);

  let filePath: string | null = null;
  let previewImagePath: string | null = null;
  let assetColumnsAvailable = true;
  const { data: assets, error: assetsError } = await supabase
    .from("templates")
    .select("file_path, preview_image_path")
    .eq("id", template.id)
    .maybeSingle();

  if (assetsError) {
    if (isMissingTemplateAssetColumns(assetsError)) {
      assetColumnsAvailable = false;
      console.warn(
        "Template asset fields are unavailable because the admin management migration has not been applied.",
      );
    } else {
      throw new Error(`Unable to load template assets: ${assetsError.message}`);
    }
  } else {
    filePath = assets?.file_path ?? null;
    previewImagePath = assets?.preview_image_path ?? null;
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("id", template.category_id)
    .eq("is_active", true)
    .maybeSingle();
  if (categoryError) {
    throw new Error(`Unable to load the template category: ${categoryError.message}`);
  }

  const price = template.is_free || Number(template.price ?? 0) === 0 ? 0 : Number(template.price ?? 0);
  const averageRating = reviews?.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : null;
  const totalReviewCount = reviewCount ?? reviews?.length ?? 0;
  const hasMoreReviews = totalReviewCount > (reviews?.length ?? 0);
  const formattedPrice = price === 0 ? "Free" : new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: template.currency || "USD",
  }).format(price);
  let previewUrl: string | null = null;
  if (previewImagePath) {
    const { data: preview, error: previewError } = await createAdminClient()
      .storage.from("template-assets")
      .createSignedUrl(previewImagePath, 300);
    if (previewError) throw new Error(`Unable to load the template preview: ${previewError.message}`);
    if (!preview?.signedUrl) throw new Error("Unable to load the template preview: no signed URL returned.");
    previewUrl = preview.signedUrl;
  }

  return (
    <section className="detail-section">
      <Link className="back-link" href="/templates">← All templates</Link>
      <div className="detail-layout">
        <div className="detail-art detail-art-large preview-founder">
          {previewUrl && <img alt={`${template.title} preview`} className="template-detail-preview" src={previewUrl} />}
          <div className="detail-art-sheet">
            <span>{category?.name || "Template"} · FORM &amp; FIELD</span>
            <strong>{template.title}</strong>
            <i />
            <small>GOOD WORK STARTS HERE</small>
          </div>
          <div className="detail-thumbnails" aria-label="Template preview views">
            <span className="detail-thumbnail detail-thumbnail-one" />
            <span className="detail-thumbnail detail-thumbnail-two" />
            <span className="detail-thumbnail detail-thumbnail-three" />
          </div>
        </div>
        <div className="detail-copy">
          <div className="eyebrow">PREMIUM TEMPLATE</div>
          <h1>{template.title}</h1>
          <p className="detail-creator">
            Form &amp; Field <span>·</span>{" "}
            {averageRating === null ? (
              <Link href="#reviews">No reviews yet</Link>
            ) : (
              <Link href="#reviews"><b>★ {averageRating.toFixed(1)}{hasMoreReviews ? " recent" : ""}</b></Link>
            )}
          </p>
          <Link
            className="button button-primary template-review-cta"
            href={
              !account?.isActive
                ? `/login?next=${encodeURIComponent(`/templates/${template.slug}#reviews`)}`
                : purchase && !ownReview
                  ? "#review-form"
                  : "#reviews"
            }
          >
            {!account?.isActive ? "Sign in to review" : purchase && !ownReview ? "Write a review" : "Review this template"}
          </Link>
          <p className="detail-description">{template.short_description}</p>
          <p className="detail-category">
            Category <Link href={category ? `/categories/${category.slug}` : "/categories"}>{category?.name || "Collections"}</Link>
          </p>
          <div className="detail-specs">
            <div>
              <h2>File formats</h2>
              <p>PDF · DOCX · editable source</p>
            </div>
            <div>
              <h2>What you can edit</h2>
              <ul>
                <li>Brand colors</li>
                <li>Text and headings</li>
                <li>Layout spacing</li>
              </ul>
            </div>
          </div>
          <div className="detail-price">
            {formattedPrice}
            <span>{price === 0 ? "Free download" : "One-time purchase"}</span>
          </div>
          {price === 0 ? (
            template.slug === "one-page-idea-worksheet" ? (
              <Link className="button button-primary" href="/downloads/free-worksheet">
                Download for free <span aria-hidden="true">↓</span>
              </Link>
            ) : (
              filePath ? (
                <Link className="button button-primary" href={`/downloads/templates/${template.id}`}>
                  Download for free <span aria-hidden="true">↓</span>
                </Link>
              ) : (
                <p className="detail-note">
                  {assetColumnsAvailable
                    ? "This free template does not have a download file yet."
                    : "Template downloads are not configured yet. Ask an administrator to apply the marketplace database migration."}
                </p>
              )
            )
          ) : (
            <Link className="button button-primary" href={`/checkout/${template.id}`}>
              Buy now <span aria-hidden="true">↗</span>
            </Link>
          )}
          {account?.isActive ? (
            favorite ? (
              <form action={removeFavoriteAction}>
                <input name="favorite_id" type="hidden" value={favorite.id} />
                <input name="return_to" type="hidden" value={`/templates/${template.slug}`} />
                <button className="detail-secondary-action favorite-action saved" type="submit">♥ Saved · Remove</button>
              </form>
            ) : (
              <form action={saveFavoriteAction}>
                <input name="template_id" type="hidden" value={template.id} />
                <input name="return_to" type="hidden" value={`/templates/${template.slug}`} />
                <button className="detail-secondary-action favorite-action" type="submit">♡ Save to favorites</button>
              </form>
            )
          ) : (
            <Link
              className="detail-secondary-action favorite-action"
              href={`/login?next=${encodeURIComponent(`/templates/${template.slug}`)}`}
            >
              Sign in to save this template
            </Link>
          )}
          {price > 0 && filePath && <Link className="detail-secondary-action" href={`/downloads/templates/${template.id}`}>Download after purchase</Link>}
          {price > 0 && (
            <Link className="detail-secondary-action" href="/contact">Questions before purchasing? Contact us</Link>
          )}
          <p className="detail-note">
            {price === 0
              ? "No purchase required. Open and use the template from your browser or download it instantly."
              : "Secure checkout will confirm your order and enable downloads after payment."}
          </p>
          {category && (
            <Link className="text-link" href={`/categories/${category.slug}`}>
              Explore {category.name.toLowerCase()} <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
      <section aria-labelledby="template-reviews-heading" className="template-reviews" id="reviews">
        <div className="template-reviews-heading">
          <div>
            <div className="eyebrow">CUSTOMER FEEDBACK</div>
            <h2 id="template-reviews-heading">Reviews</h2>
          </div>
          <p>
            {averageRating === null
              ? "No reviews yet"
              : `★ ${averageRating.toFixed(1)}${hasMoreReviews ? " recent average" : " average"} · ${totalReviewCount} ${totalReviewCount === 1 ? "review" : "reviews"}`}
          </p>
        </div>
        {reviews?.length ? (
          <div className="template-review-list">
            {reviews.map((review) => (
              <article className="template-review" key={review.id}>
                <div className="template-review-meta">
                  <span aria-label={`${review.rating} out of 5 stars`} className="template-review-stars">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </span>
                  <time dateTime={review.created_at}>
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <p>{review.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="template-review-empty">Be the first to share feedback about this template.</p>
        )}
        <div className="template-review-invitation">
          <h3>Share your experience</h3>
          {!account?.isActive ? (
            <p>
              <Link href={`/login?next=${encodeURIComponent(`/templates/${template.slug}#reviews`)}`}>
                Sign in
              </Link>{" "}
              to leave a review after purchase.
            </p>
          ) : ownReview ? (
            <p role="status">
              {ownReview.is_published
                ? "You have already reviewed this template."
                : "Your review is awaiting moderation."}
            </p>
          ) : purchase ? (
            <ReviewForm templateId={template.id} />
          ) : (
            <p>Reviews are available to customers after a completed purchase.</p>
          )}
        </div>
      </section>
    </section>
  );
}

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <PageShell>
      <Suspense fallback={<section className="detail-section"><p role="status">Loading template...</p></section>}>
        {params.then(({ slug }) => <TemplateDetailContent slug={slug} />)}
      </Suspense>
    </PageShell>
  );
}
