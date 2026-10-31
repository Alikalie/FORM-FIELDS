import Link from "next/link";
import { PageShell } from "../../components/site-chrome";

export const metadata = {
  title: "Free downloads | Form & Field",
  description: "Download a free, printable idea worksheet from Form & Field.",
};

export default function FreeDownloadsPage() {
  return (
    <PageShell>
      <section className="inner-section free-download-page">
        <Link className="back-link" href="/templates">← All templates</Link>
        <div className="free-download-layout">
          <div className="free-download-preview" aria-hidden="true">
            <div className="free-download-sheet">
              <span>FORM &amp; FIELD · FREE RESOURCE</span>
              <strong>Start with<br /><em>a first draft.</em></strong>
              <div><i /><i /><i /></div>
              <small>THE ONE-PAGE IDEA WORKSHEET</small>
            </div>
          </div>
          <div className="free-download-copy">
            <div className="eyebrow">FREE DOWNLOAD · PRINTABLE WORKSHEET</div>
            <h1>The One-Page Idea Worksheet</h1>
            <p>Get your next idea out of your head and onto the page. This printable worksheet gives you a little structure to find your focus, name your next step, and get moving.</p>
            <ul>
              <li>One simple page to print as often as you like</li>
              <li>Space to shape the idea and make a first plan</li>
              <li>No purchase required; sign in to download</li>
            </ul>
            <a className="button button-primary" href="/downloads/free-worksheet">
              Download the free worksheet <span aria-hidden="true">↓</span>
            </a>
            <p className="free-download-note">HTML file · Open and print from your browser</p>
            <Link className="text-link" href="/templates">Explore all templates <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
