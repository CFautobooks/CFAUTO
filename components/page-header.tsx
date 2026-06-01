export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-[#0b1f3a] md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
