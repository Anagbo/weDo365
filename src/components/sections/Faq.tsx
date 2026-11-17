export type FaqItem = { q: string; a: string };

/**
 * An answer the owner has not written yet is still a [bracketed] note in the
 * messages file. Those questions are left out until the text is real.
 */
const isPending = (item: FaqItem) => /\[[^\]]*\]/.test(item.a);

/** The questions that have a real answer. */
export const readyFaq = (items: FaqItem[]) =>
  items.filter((item) => !isPending(item));

/** FAQ accordion built on <details>/<summary>; works without JavaScript. */
export function Faq({ title, items }: { title: string; items: FaqItem[] }) {
  const ready = readyFaq(items);
  if (ready.length === 0) return null;

  return (
    <section aria-labelledby="faq-title">
      <div className="mx-auto max-w-[900px] px-6 pt-6 pb-16 md:pb-20">
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
