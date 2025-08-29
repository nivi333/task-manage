import React from "react";
import { mobileService } from "../../services/mobileService";
import { notificationService } from "../../services/notificationService";
import { MobileConfig } from "../../types/mobile";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const PushNotificationSetup: React.FC = () => {
  const [config, setConfig] = React.useState<MobileConfig | null>(null);
  const [attempted, setAttempted] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cfg = await mobileService.getConfig();
        if (!mounted) return;
        setConfig(cfg);
      } catch (e) {
        // non-fatal
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const setup = async () => {
      if (attempted) return;
      if (!config?.enablePush || !config.vapidPublicKey) return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      setAttempted(true);

      try {
        // Request notification permission first
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          return; // user denied or dismissed
        }
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        let sub = existing;
        if (!sub) {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey),
          });
        }
        const payload = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: (sub.toJSON() as any).keys.p256dh,
            auth: (sub.toJSON() as any).keys.auth,
          },
          userAgent: navigator.userAgent,
          platform: "web",
        };
        await mobileService.submitPushToken(payload);
        notificationService.info("Push notifications enabled.");
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error("[Push] setup error", err);
        notificationService.error("Failed to enable push notifications.");
      }
    };
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  return null;
};

export default PushNotificationSetup;
