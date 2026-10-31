import Link from "next/link";
import { PageIntro, PageShell } from "./site-chrome";

export function InformationPage({
  eyebrow,
  title,
  description,
  message,
  link,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  message: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <PageShell>
      <section className="inner-section information-section">
        <PageIntro eyebrow={eyebrow} title={title} description={description} />
        <div className="information-card">
          <p>{message}</p>
          <Link className="button button-primary" href={link}>
            {linkLabel} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
