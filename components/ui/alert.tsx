 import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, InfoIcon } from 'lucide-react';

const variants = {
  default: 'bg-background text-foreground',
  destructive: 'bg-destructive/15 text-destructive dark:bg-destructive/20',
  success: 'bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-500 dark:bg-amber-500/20',
  info: 'bg-blue-500/15 text-blue-500 dark:bg-blue-500/20',
  cosmic: 'bg-purple-500/15 text-purple-500 dark:bg-purple-500/20 border-purple-500/20',
};

const icons = {
  default: AlertCircle,
  destructive: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: InfoIcon,
  cosmic: AlertCircle,
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  icon?: boolean;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Alert({
  variant = "default",
  icon = true,
  title,
  description,
  action,
  className,
  ...props
}: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon className="h-4 w-4" />}
      <div className={`${icon ? 'pl-7' : ''}`}>
        {title && (
          <h5 className="mb-1 font-medium leading-none tracking-tight">
            {title}
          </h5>
        )}
        {description && (
          <div className="text-sm [&_p]:leading-relaxed">
            {description}
          </div>
        )}
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    />
  );
}