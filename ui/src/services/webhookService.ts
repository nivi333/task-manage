import apiClient from "./apiClient";

export interface WebhookDto {
  id?: string;
  callbackUrl: string;
  secret: string;
  events: string[];
  active?: boolean;
}

export const webhookService = {
  async list() {
    const res = await apiClient.get<WebhookDto[]>("/webhooks");
    return res.data;
  },
  async create(webhook: Omit<WebhookDto, "id">) {
    const res = await apiClient.post<WebhookDto>("/webhooks", webhook);
    return res.data;
  },
  async delete(id: string) {
    await apiClient.delete(`/webhooks/${encodeURIComponent(id)}`);
  },
};
