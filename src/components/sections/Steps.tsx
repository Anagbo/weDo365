export type Step = { title: string; text: string };

/** "How it works": numbered steps with green circles. */
export function Steps({
  id,
  title,
  steps,
  className = "",
}: {
  id?: string;
  title: string;
  steps: Step[];
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;

  return (
    <section id={id} aria-labelledby={headingId} className={className}>
      <div className="container-site flex flex-col gap-8 py-14 md:py-18">
        <h2 id={headingId} className="text-h2-sm md:text-h2">
          {title}
        </h2>
        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2.5">
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-full bg-green text-lg font-bold text-white"
              >
                {i + 1}
              </span>
              <h3 className="text-[21px] leading-tight">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
