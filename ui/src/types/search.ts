export type SearchEntityType = 'TASK' | 'PROJECT' | 'USER' | 'COMMENT';

export interface GlobalSearchFilters {
  entityTypes?: SearchEntityType[];
  sortBy?: 'relevance' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GlobalSearchRequest extends GlobalSearchFilters {
  query: string;
}

export interface SearchResultItem {
  id: string;
  type: SearchEntityType;
  title: string;
  snippet?: string;
  url?: string;
  updatedAt?: string;
}

export interface GlobalSearchResponse {
  results: SearchResultItem[];
}

export interface SavedSearch {
  id?: string;
  name: string;
  query: string;
  filters?: GlobalSearchFilters;
  createdAt?: string;
}
