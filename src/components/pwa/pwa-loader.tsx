import { useEffect } from "react";

export function PWALoader() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered:", registration);
            
            // Handle updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // New content available, but we don't force reload to avoid breaking session
                    console.log("New version available. Refresh to update.");
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("SW registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
