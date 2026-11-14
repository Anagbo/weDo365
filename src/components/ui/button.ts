const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold whitespace-nowrap no-underline transition-colors";

const variants = {
  /** Accent, white text. Primary actions only. */
  primary: "bg-accent text-white hover:bg-accent/90",
  /** Transparent with a 1.5px ink border. */
  secondary: "border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink/5",
} as const;

export type ButtonVariant = keyof typeof variants;

/** Class names for a pill button, usable on <a>, <Link> and <button>. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  extra?: string,
) {
  return [base, variants[variant], extra].filter(Boolean).join(" ");
}
