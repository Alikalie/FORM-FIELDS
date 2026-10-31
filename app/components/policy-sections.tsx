export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  after?: string;
};

export function PolicySections({
  sections,
  disclaimer,
}: {
  sections: PolicySection[];
  disclaimer?: string;
}) {
  return (
    <div className="policy-copy">
      <p><strong>Last updated: October 31, 2026</strong></p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.bullets && (
            <ul>
              {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          )}
          {section.after && <p>{section.after}</p>}
        </section>
      ))}
      {disclaimer && <p><em>{disclaimer}</em></p>}
    </div>
  );
}
