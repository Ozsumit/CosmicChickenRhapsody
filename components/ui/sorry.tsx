"use client";
import React, { useState, useEffect } from "react";

const RedirectOverlay: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(true);

  useEffect(() => {
    // Function to check screen size
    const checkViewport = () => {
      const width = window.innerWidth;
      // Set the threshold for mobile screens (e.g., 768px)
      setIsMobile(width >= 768);
    };

    // Check on load
    checkViewport();

    // Add event listener to check on resize
    window.addEventListener("resize", checkViewport);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  if (isMobile) {
    return null; // Don't show anything for mobile users
  }

  return (
    <div style={overlayStyle}>
      <div style={messageStyle}>
        <h2>Redirect Notice</h2>
        <p>
          {" "}
          Sorry! This game is not optized for mobile and will not be in the
          future. Sorry for the inconvinence.But hey! im working on a mobile
          exclusive game too. stay tuned for that
        </p>
      </div>
    </div>
  );
};

// Styles for the overlay
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

// Styles for the message box
const messageStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  maxWidth: "500px",
  width: "90%",
};

export default RedirectOverlay;
