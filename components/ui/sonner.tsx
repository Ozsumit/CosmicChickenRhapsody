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
      background: "#1e1e1e", // Dark background for modern sleek theme
      color: "#fff",
      borderRadius: "8px",
      padding: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow for sleek look
    },
    iconTheme: {
      primary: "#4aed88", // Vibrant green color for the icon
      secondary: "#fff",
    },
    className: "custom-toast", // Optional class for custom styles
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
        background: "#1e1e1e", // Consistent dark theme
        color: "#fff",
        borderRadius: "8px",
        padding: "12px",
      },
      icon: "🔗",
    }
  );
};

export { Toaster, hotToast as toast };
