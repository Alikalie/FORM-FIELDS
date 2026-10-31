import Link from "next/link";
import { CategoryForm } from "@/app/admin/_components/category-form";

export default function NewCategoryPage() {
  return (
    <main className="admin-content">
      <Link className="admin-back-link" href="/admin/categories">← All categories</Link>
      <header className="admin-page-heading"><div><div className="admin-eyebrow">CATALOG MANAGEMENT / NEW CATEGORY</div><h1>Add a category</h1><p>Create a clear storefront collection so customers can browse related templates.</p></div></header>
      <section className="admin-form-card">
        <div className="admin-form-card-intro"><span aria-hidden="true">▦</span><div><h2>Category setup</h2><p>Complete the details below. You can change these settings at any time.</p></div></div>
        <CategoryForm />
      </section>
    </main>
  );
}
