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
      <h1 className="max-w-3xl text-4xl md:text-[56px] md:leading-[1.08]">
        {title}
      </h1>
      {lead ? (
        <p className="mt-5 max-w-2xl text-lg text-muted md:text-[19px]">
          {lead}
        </p>
      ) : null}
    </div>
  );
}
