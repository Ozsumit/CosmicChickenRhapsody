import { useEffect } from "react";

const DEPLOYMENT_VERSION = "2024-09-20-1"; // Update this with each deployment

export function PushNotificationSubscriber() {
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(async (registration) => {
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            try {
              subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "BCe9fTDX_re2BZ7glluS867u39aNnLYggi4QT58q64euYLN9ijSMomlt7os94-YWAbBCSmdvIReJeqYIusnq6w0",
              });
              // Send the subscription to your server
              await fetch("/api/subscribe", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  subscription: subscription,
                  deploymentVersion: DEPLOYMENT_VERSION,
                }),
              });
              console.log("Push notification subscription successful");
            } catch (error) {
              console.error(
                "Failed to subscribe to push notifications:",
                error
              );
            }
          }
        });
    }
  }, []);

  return null;
}
