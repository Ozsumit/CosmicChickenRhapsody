"use client";

import React from "react";
import { Toaster as HotToaster, toast as hotToast } from "react-hot-toast";
import Link from "next/link";

type ToasterProps = React.ComponentProps<typeof HotToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  const toastOptions = {
    duration: 5000,
    position: "top-right" as const,
    style: {
      background: "#333",
      color: "#fff",
      borderRadius: "8px",
      padding: "12px",
    },
    iconTheme: {
      primary: "#4aed88",
      secondary: "#fff",
    },
    className: "custom-toast",
  };

  return <HotToaster toastOptions={toastOptions} {...props} />;
};

// Custom function to show toast with link
export const showToastWithLink = (
  message: string,
  linkText: string,
  linkHref: string
) => {
  hotToast(
    <div>
      {message}{" "}
      <Link href={linkHref} className="text-blue-400 underline">
        {linkText}
      </Link>
    </div>,
    {
      style: {
        background: "#333",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px",
      },
      icon: "🔗",
    }
  );
};

export { Toaster, hotToast as toast };
