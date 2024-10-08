"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/buttonmsp";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallAndNotifications: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);

      // Automatically close after 10 seconds
      setTimeout(() => {
        setShowInstallPrompt(false);
      }, 10000); // 10 seconds
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "T" || event.key === "t") {
        setShowInstallPrompt((prev) => !prev); // Toggle prompt visibility
      }
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("keydown", handleKeyDown); // Listen for "T" key

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      registerServiceWorker();
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("keydown", handleKeyDown); // Cleanup key event listener
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      console.log("Service Worker registered with scope:", registration.scope);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
        }
      } catch (error) {
        console.error("Error during installation:", error);
      } finally {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  return (
    <>
      {showInstallPrompt && !isInstalled && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-800 text-white p-4 rounded-lg shadow-lg z-[100] flex items-center space-x-3 transition-transform transform scale-100 hover:scale-105">
          <Download className="h-5 w-5 text-gray-300" />
          <p className="text-sm">Install our app </p>
          <Button
            onClick={handleInstall}
            variant="outline"
            size="sm"
            className="bg-slate-800 hover:bg-slate-700 text-white rounded px-3 py-1 transition-all"
          >
            Install
          </Button>
          <Button
            onClick={() => setShowInstallPrompt(false)}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
};

export default PWAInstallAndNotifications;
