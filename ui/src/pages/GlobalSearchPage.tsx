import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Divider, Input, Modal, Row, Space, Typography } from 'antd';
import AppLayout from '../components/layout/AppLayout';
import { HeaderTitle, SearchBar } from '../components/common';
import FilterChips from '../components/search/FilterChips';
import SearchResults from '../components/search/SearchResults';
import SearchHistory from '../components/search/SearchHistory';
import searchService from '../services/searchService';
import { GlobalSearchFilters, GlobalSearchRequest, SavedSearch, SearchResultItem } from '../types/search';

const GlobalSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<GlobalSearchFilters>({ entityTypes: [], sortBy: 'relevance', sortOrder: 'desc' });
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SavedSearch[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const runSearch = useCallback(async (q: string, f: GlobalSearchFilters) => {
    if (!q || !q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const req: GlobalSearchRequest = { query: q.trim(), ...f };
      const res = await searchService.search(req);
      setResults(res.results || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const list = await searchService.listSavedSearches();
      setHistory(list);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const onSearch = (val?: string) => {
    const q = typeof val === 'string' ? val : query;
    runSearch(q, filters);
  };

  const onUseSaved = (s: SavedSearch) => {
    setQuery(s.query);
    setFilters({ ...filters, ...(s.filters || {}) });
    runSearch(s.query, { ...filters, ...(s.filters || {}) });
  };

  const onOpenSave = () => {
    setSaveName(query.trim());
    setSaveModalOpen(true);
  };

  const onConfirmSave = async () => {
    const payload: SavedSearch = { name: saveName || 'Saved Search', query, filters };
    await searchService.saveSavedSearch(payload);
    setSaveModalOpen(false);
    setSaveName('');
    loadHistory();
  };

  const headerExtras = useMemo(() => (
    <Space>
      <Button onClick={() => onSearch()} type="primary">Search</Button>
      <Button onClick={onOpenSave} disabled={!query.trim()}>Save</Button>
    </Space>
  ), [query, filters]);

  return (
    <AppLayout title={<HeaderTitle level={3}>Global Search</HeaderTitle>} contentPadding={16}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Space wrap>
          <SearchBar value={query} onChange={setQuery} onSearch={onSearch} width={400} placeholder="Search tasks, projects, users, comments..." />
          {headerExtras}
        </Space>
        <FilterChips filters={filters} onChange={setFilters} />
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Card title="Results" bodyStyle={{ paddingTop: 12 }}>
              <SearchResults results={results} loading={loading} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <SearchHistory items={history} loading={historyLoading} onSelect={onUseSaved} />
          </Col>
        </Row>
      </Space>

      <Modal
        title="Save Search"
        open={saveModalOpen}
        onOk={onConfirmSave}
        onCancel={() => setSaveModalOpen(false)}
        okButtonProps={{ disabled: !query.trim() }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Text type="secondary">Give this search a name to reuse later.</Typography.Text>
          <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="e.g., My open tasks" />
        </Space>
      </Modal>
    </AppLayout>
  );
};

export default GlobalSearchPage;
