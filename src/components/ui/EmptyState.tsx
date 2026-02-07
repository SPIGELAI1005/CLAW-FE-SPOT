import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 text-stone-400 dark:text-stone-600">{icon}</div>
      )}
      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
        {title}
      </div>
      {description && (
        <div className="mt-1.5 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          {description}
        </div>
      )}
      {actionLabel && actionHref && (
        <div className="mt-5">
          <Button as="link" href={actionHref} variant="primary">
            {actionLabel}
          </Button>
        </div>
      )}
      {actionLabel && onAction && !actionHref && (
        <div className="mt-5">
          <Button as="button" variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
