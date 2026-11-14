import type { ReactNode } from "react";

/**
 * Renders `text` with the first case-insensitive match of `needle` replaced
 * by `render(match)`, e.g. to turn "integritetspolicy" or the phone number
 * inside a translated sentence into a link. Returns the plain text if there
 * is no match.
 */
export function linkText(
  text: string,
  needle: string,
  render: (match: string) => ReactNode,
): ReactNode {
  const at = text.toLowerCase().indexOf(needle.toLowerCase());
  if (!needle || at === -1) return text;
  const match = text.slice(at, at + needle.length);
  return (
    <>
      {text.slice(0, at)}
      {render(match)}
      {text.slice(at + needle.length)}
    </>
  );
}
