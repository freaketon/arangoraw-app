interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-3xl text-text-muted mb-3">{icon}</div>
      <h3 className="text-sm font-medium text-text-secondary mb-1">{title}</h3>
      {description && <p className="text-xs text-text-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
