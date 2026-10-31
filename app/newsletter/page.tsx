import { InformationPage } from "../components/information-page";

export default function NewsletterPage() {
  return (
    <InformationPage
      eyebrow="A NOTE FROM US"
      title="Good things, occasionally."
      description="A little inspiration from Form & Field, never noise."
      message="Our newsletter is still taking shape. Create an account and explore the collection while we prepare the first note."
      link="/signup"
      linkLabel="Create an account"
    />
  );
}
