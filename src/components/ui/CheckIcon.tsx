/** The single check icon used in every trust and feature list. */
export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 text-green ${className}`}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
