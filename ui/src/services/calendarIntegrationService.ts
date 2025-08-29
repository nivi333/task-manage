import apiClient from "./apiClient";

export interface CreateCalendarEventPayload {
  title: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export const calendarIntegrationService = {
  async createEvent(payload: CreateCalendarEventPayload) {
    // Backend expects query params via @RequestParam
    const params = new URLSearchParams({
      title: payload.title,
      startTime: payload.startTime,
      endTime: payload.endTime,
    }).toString();
    const res = await apiClient.post<string>(
      `/integrations/calendar/create-event?${params}`
    );
    return res.data;
  },
};
