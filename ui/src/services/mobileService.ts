import apiClient from "./authService";
import { MobileConfig, PushSubscriptionPayload } from "../types/mobile";

export const mobileService = {
  getConfig: async (): Promise<MobileConfig> => {
    const res = await apiClient.get("/mobile/config");
    return res.data;
  },
  submitPushToken: async (payload: PushSubscriptionPayload): Promise<void> => {
    await apiClient.post("/mobile/push-token", payload);
  },
};
