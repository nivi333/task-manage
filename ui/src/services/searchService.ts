import apiClient from './authService';
import { notificationService } from './notificationService';
import { GlobalSearchRequest, GlobalSearchResponse, SavedSearch } from '../types/search';

const SEARCH_API = '/search';
const SAVED_API = '/saved-searches';

const search = async (req: GlobalSearchRequest): Promise<GlobalSearchResponse> => {
  try {
    const params: any = { query: req.query };
    if (req.entityTypes && req.entityTypes.length) params.entityTypes = req.entityTypes.join(',');
    if (req.sortBy) params.sortBy = req.sortBy;
    if (req.sortOrder) params.sortOrder = req.sortOrder;
    const response = await apiClient.get<GlobalSearchResponse>(SEARCH_API, { params });
    return response.data ?? { results: [] };
  } catch (error) {
    notificationService.error('Search failed.');
    throw error;
  }
};

const listSavedSearches = async (): Promise<SavedSearch[]> => {
  try {
    const response = await apiClient.get<SavedSearch[]>(SAVED_API);
    const data: any = response.data;
    if (Array.isArray(data)) return data as SavedSearch[];
    if (data && Array.isArray(data.content)) return data.content as SavedSearch[];
    return [];
  } catch (error) {
    // no popup for listing
    throw error;
  }
};

const saveSavedSearch = async (save: SavedSearch): Promise<SavedSearch> => {
  try {
    const response = await apiClient.post<SavedSearch>(SAVED_API, save);
    notificationService.success('Search saved');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const searchService = { search, listSavedSearches, saveSavedSearch };
export default searchService;
