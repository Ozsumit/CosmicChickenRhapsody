import React from "react";
import { AlertCircle, CheckCircle2, XCircle, InfoIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  title?: string;
  message: string;
  variant?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
//   className?: string;
  showIcon?: boolean;
  action?: React.ReactNode;
  autoClose?: boolean;

    children?: React.ReactNode;
    // variant: string;
    className?: string;

  autoCloseTime?: number;
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className,
  ...props
}) => (
  <p
    className={cn("text-sm opacity-90", className)}
    {...props}
  >
    {children}
  </p>
);

const Alert: React.FC<AlertProps> = ({
  title,
  message,
  variant = "info",
  onClose,
  className,
  showIcon = true,
  action,
  autoClose = false,
  autoCloseTime = 5000,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const variants = {
    info: {
      icon: <InfoIcon className="w-5 h-5" />,
      classes: "bg-blue-950/30 border-blue-800/50 text-blue-200",
      iconColor: "text-blue-400",
    },
    success: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      classes: "bg-emerald-950/30 border-emerald-800/50 text-emerald-200",
      iconColor: "text-emerald-400",
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      classes: "bg-red-950/30 border-red-800/50 text-red-200",
      iconColor: "text-red-400",
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      classes: "bg-amber-950/30 border-amber-800/50 text-amber-200",
      iconColor: "text-amber-400",
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 transition-all duration-300",
        currentVariant.classes,
        isClosing && "opacity-0 scale-95",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={cn("shrink-0 mt-0.5", currentVariant.iconColor)}>
            {currentVariant.icon}
          </div>
        )}

        <div className="flex-1">
          {title && (
            <h5 className="mb-1 font-semibold leading-none tracking-tight">
              {title}
            </h5>
          )}
          <AlertDescription>{message}</AlertDescription>
          {action && <div className="mt-3">{action}</div>}
        </div>

        {onClose && (
          <button
            onClick={handleClose}
            className={cn(
              "shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity",
              "hover:bg-white/10"
            )}
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Close alert</span>
          </button>
        )}
      </div>

      {autoClose && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-white/20 transition-all duration-300"
          style={{
            width: "100%",
            animation: `shrink ${autoCloseTime}ms linear forwards`,
          }}
        />
      )}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

// Export both components
export { Alert, AlertDescription };

// Example usage with both Alert and AlertDescription
const AlertExample: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Basic Alert */}
      <Alert
        title="Information"
        message="This is a basic info alert with an icon."
        onClose={() => console.log("closed")}
      />

      {/* Success Alert with Auto Close */}
      <Alert
        variant="success"
        message="Operation completed successfully!"
        autoClose
        autoCloseTime={3000}
      />

      {/* Warning Alert with Action */}
      <Alert
        variant="warning"
        title="Warning"
        message="Your session is about to expire."
        action={
          <button className="px-3 py-1 text-sm rounded-md bg-amber-500/20 hover:bg-amber-500/30 transition-colors">
            Extend Session
          </button>
        }
      />

      {/* Error Alert */}
      <Alert
        variant="error"
        title="Error"
        message="Failed to save changes. Please try again."
        showIcon
        onClose={() => console.log("closed")}
      />
    </div>
  );
};

export default AlertExample;