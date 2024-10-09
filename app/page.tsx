"use client";
import React, { useState, useCallback, useEffect } from "react";
import CosmicChickenRhapsody from "@/components/ui/game";
import PWAInstallAndNotifications from "@/components/ui/install";
import RedirectOverlay from "@/components/ui/sorry";
import Welcome from "@/components/ui/welcome";
import { Button } from "@/components/ui/buttonmsp";
import { RefreshCw } from "lucide-react";
// import SidebarWrapper from "@/components/ui/leaderboard";

const siteFeatures = ["Offline capability", "Reset Game", "Harder Gameplay"];

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [wave, setWave] = useState<number | null>(null);

  const fetchData = useCallback(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      const highestWave = localStorage.getItem("highestWave");

      if (storedName) {
        setUserName(storedName);
      } else {
        console.log("Username not found in localStorage.");
      }

      if (highestWave) {
        try {
          const waveValue = JSON.parse(highestWave);
          if (isNaN(waveValue)) {
            throw new Error("Invalid wave value");
          }
          setWave(waveValue);
        } catch (error) {
          console.error("Error parsing wave data:", error);
        }
      } else {
        console.log("Wave value not found in localStorage.");
      }
    }
  }, []);

  const updateDonation = useCallback(async () => {
    if (userName && wave !== null) {
      try {
        const response = await fetch("/api/data", {
          // Correct path to API
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userName,
            wave: wave,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Data updated:", data);
      } catch (error) {
        console.error("Error updating data:", error);
      }
    } else {
      console.log("UserName or Wave not found or invalid.");
    }
  }, [userName, wave]);

  const handleManualUpdate = () => {
    fetchData();
    updateDonation();
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle mute with the "M" key
      if (event.key === "U" || event.key === "u") {
        handleManualUpdate(); // Toggle mute/unmute
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="flex flex-col justify-center items-center">
      <CosmicChickenRhapsody />
      <PWAInstallAndNotifications />
      <Welcome features={siteFeatures} />
      <RedirectOverlay />
      <Button
        onClick={handleManualUpdate}
        className="bg-slate-900 hover:bg-slate-800 hidden text-slate-100 border border-slate-700/50 shadow-lg  items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" /> Update Manually
      </Button>
    </div>
  );
}
