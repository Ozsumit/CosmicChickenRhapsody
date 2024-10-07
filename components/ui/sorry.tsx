"use client";
import React, { useState, useEffect } from "react";

const RedirectOverlay: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Function to check if the device is mobile or tablet
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor;

      // Check for mobile or tablet user agents
      if (
        /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        )
      ) {
        setIsMobile(true);
        // Disable scrolling
        document.body.style.overflow = "hidden";
      } else {
        setIsMobile(false);
        // Enable scrolling when not on mobile/tablet
        document.body.style.overflow = "auto";
      }
    };

    // Run the check on initial load
    checkDevice();

    // Optionally, listen to window resize to handle viewport changes (not needed if userAgent works well)
    window.addEventListener("resize", checkDevice);

    // Clean up event listener and reset body scroll when unmounting
    return () => {
      window.removeEventListener("resize", checkDevice);
      document.body.style.overflow = "auto"; // Reset scrolling when component unmounts
    };
  }, []);

  if (!isMobile) {
    return null; // Don't show the overlay for non-mobile/tablet devices
  }

  return (
    <div style={overlayStyle}>
      <div style={messageStyle}>
        <h2 className="text-3xl text-red-600 font-extrabold">
          Not Supported!!!
        </h2>
        <p>
          {`Sorry! This game is not optimized for mobile or tablets and won't be
          supported in the future. But good news—I'm working on a mobile-exclusive game too! Stay tuned for that.`}
        </p>
      </div>
    </div>
  );
};

// Styles for the overlay
const overlayStyle: React.CSSProperties = {
  position: "fixed", // Full screen fixed position
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark overlay
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999, // Ensure it's on top of everything
  pointerEvents: "all", // Ensure the overlay can be interacted with
};

// Styles for the message box
const messageStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "10px",
  textAlign: "center",
  maxWidth: "500px",
  width: "90%",
  color: "#0a0a0a",
  pointerEvents: "none", // Ensure the message itself isn't interactive
};

export default RedirectOverlay;
