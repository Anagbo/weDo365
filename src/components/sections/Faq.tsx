export type FaqItem = { q: string; a: string };

/** FAQ accordion built on <details>/<summary>; works without JavaScript. */
export function Faq({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-title">
      <div className="mx-auto max-w-[900px] px-6 pt-6 pb-16 md:pb-20">
        <h2 id="faq-title" className="mb-3 text-h2-sm md:text-h2">
          {title}
        </h2>
        {items.map((item) => (
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
