/** Temporary page body used until each page is built in its own phase. */
export function PagePlaceholder({
  title,
  lead,
}: {
  title: string;
  lead?: string;
}) {
  return (
    <div className="container-site py-16 md:py-24">
      <h1 className="max-w-3xl text-h1-sm md:text-h1">{title}</h1>
      {lead ? (
        <p className="mt-5 max-w-[620px] text-lead text-muted">{lead}</p>
      ) : null}
    </div>
  );
}
