import Link from "next/link";

export function FormFieldsLogo({
  className,
  subtitle,
}: {
  className: string;
  subtitle: string;
}) {
  return (
    <Link aria-label="Form & Field home" className={className} href="/">
      <span aria-hidden="true" className="form-fields-logo-mark">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="form-fields-logo-copy">
        <strong>form<span>&amp;</span>field</strong>
        <small>{subtitle}</small>
      </span>
    </Link>
  );
}
