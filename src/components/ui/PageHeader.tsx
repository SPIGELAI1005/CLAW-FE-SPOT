interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // action buttons
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight text-stone-900 sm:text-xl md:text-2xl dark:text-stone-50">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
