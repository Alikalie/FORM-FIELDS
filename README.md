This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Super Admin management setup

Apply `supabase/migrations/20261030150000_admin_management.sql` to the Supabase project before using template uploads/downloads, review moderation, contact-message management, user account controls, or the site-content editor. The migration creates the private `template-assets` Storage bucket and its policies, and adds the `claim_free_template_download`, `record_paid_template_download`, and `record_template_download` RPCs used to enforce download access.

Set `SUPABASE_SERVICE_ROLE_KEY` as a server-only environment variable for secure signed preview and download URLs. Never prefix this key with `NEXT_PUBLIC_` or expose it in browser code. Without it, those private asset operations intentionally fail rather than falling back to public access.

The Site Content editor stores plain text in the Supabase `site_content.content` column. Homepage keys include `homepage.hero_title_prefix`, `homepage.hero_title_emphasis`, and `homepage.hero_description`; navigation keys include `navigation.templates`, `navigation.categories`, and `navigation.how_it_works`; footer keys use `footer.*`. Static page keys follow `<page>.<field>` (for example `about.title`, `terms.body`). FAQ items use `faq.items`, with one `topic | question | answer` entry per line. Contact topics are stored in the existing `contact_messages.subject` column.
