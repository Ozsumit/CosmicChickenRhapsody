"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import CosmicChickenRhapsody from "@/components/ui/game";
import PWAInstallAndNotifications from "@/components/ui/install";
import RedirectOverlay from "@/components/ui/sorry";
import Welcome from "@/components/ui/welcome";
import { Button } from "@/components/ui/buttonmsp";
import { RefreshCw } from "lucide-react";

const siteFeatures = ["Offline capability", "Reset Game", "Harder Gameplay"];

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [wave, setWave] = useState<number | null>(null);

  // Create a ref for the button
  const updateButtonRef = useRef<HTMLButtonElement | null>(null);

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

  // Automatically trigger button click when the component mounts
  useEffect(() => {
    if (updateButtonRef.current) {
      updateButtonRef.current.click(); // Trigger the button click
    }
  }, []);

  // Automatically update data every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (updateButtonRef.current) {
        updateButtonRef.current.click(); // Trigger the button click
      }
    }, 5000); // 45 seconds

    return () => clearInterval(interval);
  }, [fetchData, updateDonation]);

  return (
    <div className="flex flex-col justify-center items-center">
      <CosmicChickenRhapsody />
      <PWAInstallAndNotifications />
      <Welcome features={siteFeatures} />
      <RedirectOverlay />
      <Button
        onClick={handleManualUpdate}
        ref={updateButtonRef} // Assign ref to the button
        className="bg-slate-900 hover:bg-slate-800 hidden text-slate-100 border border-slate-700/50 shadow-lg items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" /> Update Manually
      </Button>
    </div>
  );
}
