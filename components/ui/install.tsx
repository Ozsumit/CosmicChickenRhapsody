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

// interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
//   sync?: {
//     register(tag: string): Promise<void>;
//   };
// }

const PWAInstallAndNotifications: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      // setIsPushSupported(true);
      registerServiceWorker();
      // checkSubscription();
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
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

  // const checkSubscription = async () => {
  //   try {
  //     const registration = await navigator.serviceWorker.ready;
  //     const subscription = await registration.pushManager.getSubscription();
  //     setIsSubscribed(!!subscription);
  //     if (!subscription) {
  //       setShowNotificationPrompt(true);
  //     }
  //   } catch (error) {
  //     console.error("Error checking subscription:", error);
  //   }
  // };

  return (
    <>
      {showInstallPrompt && !isInstalled && (
        <div className="fixed top-0 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-[100] flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <p className="text-sm">Install our app!</p>
          <Button onClick={handleInstall} variant="outline" size="sm">
            Install
          </Button>
          <Button
            onClick={() => setShowInstallPrompt(false)}
            variant="ghost"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {/* {isPushSupported && showNotificationPrompt && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-[100] flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <p className="text-sm z-50">
            {isSubscribed ? "Notifications enabled" : "Enable notifications?"}
          </p>
          <Button
            onClick={isSubscribed ? unsubscribeUser : subscribeUser}
            variant="outline"
            size="sm"
          >
            {isSubscribed ? "Disable" : "Enable"}
          </Button>
          <Button
            onClick={() => setShowNotificationPrompt(false)}
            variant="ghost"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )} */}
    </>
  );
};

export default PWAInstallAndNotifications;
