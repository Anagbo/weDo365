import { SECTION } from "@/components/ui/spacing";
import { isTodo } from "@/lib/todo";

export type FaqItem = { q: string; a: string };

/**
 * An answer the owner has not written yet starts with "TODO" in the messages
 * file. A FAQ is shown only when every answer is real, so a visitor never
 * sees a half-empty list.
 */
const isPending = (item: FaqItem) => isTodo(item.a);

/** The questions to show: all of them, or none while any answer is missing. */
export const readyFaq = (items: FaqItem[]) =>
  items.length > 0 && !items.some(isPending) ? items : [];

/** FAQ accordion built on <details>/<summary>; works without JavaScript. */
export function Faq({ title, items }: { title: string; items: FaqItem[] }) {
  const ready = readyFaq(items);
  if (ready.length === 0) return null;

  return (
    <section aria-labelledby="faq-title" className={SECTION}>
      <div className="container-site">
        <h2 id="faq-title" className="mb-3 text-h2-sm md:text-h2">
          {title}
        </h2>
        {ready.map((item) => (
          <details key={item.q} className="border-b border-line">
            {/* Padding sits on <summary> so the whole row is clickable. */}
            <summary className="cursor-pointer py-[18px] text-lg font-semibold text-ink">
              {item.q}
            </summary>
            <p className="max-w-[760px] pb-[18px] text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
