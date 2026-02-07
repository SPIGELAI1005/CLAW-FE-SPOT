export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[var(--card-shadow)] ${className}`}
    >
      {children}
    </div>
  );
}
