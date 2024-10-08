import React, {  ReactNode } from "react";

interface DialogProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  children,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-content border-2 border-white rounded-lg p-4 m-3">
        {children}
        <button
          className="dialog-close z-50 bg-blue-400/50 rounded-md flex justify-center items-center w-4/12 h-8 p-2 mb-4"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface DialogTriggerProps {
  children: ReactNode;
  onOpen: () => void;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  onOpen,
}) => {
  return <div onClick={onOpen}>{children}</div>;
};

interface DialogHeaderProps {
  children: ReactNode;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="dialog-header">{children}</div>;
};

interface DialogTitleProps {
  children: ReactNode;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <h2 className="dialog-title">{children}</h2>;
};

interface DialogContentProps {
  children: ReactNode;
  // className: String;
}

export const DialogContent: React.FC<DialogContentProps> = ({ children }) => {
  return <div className="dialog-body">{children}</div>;
};
