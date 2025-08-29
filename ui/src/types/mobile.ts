export interface MobileConfig {
  enableOffline: boolean;
  enablePush: boolean;
  vapidPublicKey?: string | null;
  minAppVersion: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  platform?: string; // web | ios | android
}
