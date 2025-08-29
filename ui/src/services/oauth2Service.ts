import apiClient from "./apiClient";

export const oauth2Service = {
  async getAuthorizationUrl(provider: string): Promise<string> {
    const res = await apiClient.get<{ authorization_url: string }>(
      `/oauth2/authorize/${encodeURIComponent(provider)}`
    );
    return res.data.authorization_url;
  },

  async startAuthorization(provider: string) {
    const url = await this.getAuthorizationUrl(provider);
    // Redirect the current window to begin OAuth2 flow
    window.location.href = url;
  },
};
