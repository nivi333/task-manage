import apiClient from "./authService";

export interface ApiKeyModel {
  id: string;
  apiKey: string; // full key returned on generation; may be masked in list
  name: string;
  active: boolean;
  createdAt: string;
}

class ApiKeyService {
  private base = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/v1") + 
    "/apikeys";

  async list(): Promise<ApiKeyModel[]> {
    const { data } = await apiClient.get(this.base);
    return (data || []).map((k: any) => ({
      id: k.id,
      apiKey: k.apiKey,
      name: k.name,
      active: k.active,
      createdAt: k.createdAt,
    }));
  }

  async generate(name: string): Promise<ApiKeyModel> {
    const params = new URLSearchParams({ name });
    const { data } = await apiClient.post(`${this.base}/generate?${params}`);
    return {
      id: data.id,
      apiKey: data.apiKey,
      name: data.name,
      active: data.active,
      createdAt: data.createdAt,
    };
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.base}/${id}`);
  }
}

export const apiKeyService = new ApiKeyService();
