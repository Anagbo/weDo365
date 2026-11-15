import { POSTAL_ADDRESS_LINES } from "@/config/company";

/**
 * The company's postal address (not a visiting address), with its label.
 * Shown only in the footer and on the legal pages.
 */
export function PostalAddress({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <address className={`not-italic ${className}`}>
      <span className="font-semibold">{label}</span>
      {POSTAL_ADDRESS_LINES.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </address>
  );
}
