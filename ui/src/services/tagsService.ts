import apiClient from "./authService";

export interface TagSummary {
  name: string;
  count: number;
}

const normalize = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

let cache: TagSummary[] | null = null;

export const tagsService = {
  async list(): Promise<TagSummary[]> {
    if (cache) return cache;
    const res = await apiClient.get("/tags");
    // Ensure normalization de-duplication on client side just in case
    const map = new Map<string, TagSummary>();
    (res.data?.data || res.data || []).forEach((t: any) => {
      const key = normalize(t.name || t.tag || "");
      if (!key) return;
      const existing = map.get(key);
      const count = Number(t.count ?? t.usage ?? 0);
      if (existing) {
        existing.count += count;
      } else {
        map.set(key, { name: t.name || key, count });
      }
    });
    cache = Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return cache;
  },

  async rename(oldName: string, newName: string): Promise<any> {
    const body = { name: newName };
    const res = await apiClient.patch(`/tags/${encodeURIComponent(oldName)}/rename`, body);
    cache = null;
    return res.data;
  },

  async merge(from: string, to: string): Promise<any> {
    const res = await apiClient.post("/tags/merge", { from, to });
    cache = null;
    return res.data;
  },

  async delete(name: string): Promise<any> {
    const res = await apiClient.delete(`/tags/${encodeURIComponent(name)}`);
    cache = null;
    return res.data;
  },

  async names(): Promise<string[]> {
    const list = await this.list();
    // Return display names as they came (not lowercased), but unique by normalized
    const seen = new Set<string>();
    const names: string[] = [];
    for (const t of list) {
      const key = normalize(t.name);
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(t.name);
    }
    return names;
  },

  invalidateCache() {
    cache = null;
  },

  normalize,
};

export default tagsService;
