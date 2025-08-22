import React, { useEffect, useMemo, useState } from 'react';
import { Card, Avatar, Tag, Typography, Space, Empty, Skeleton, Checkbox, Row, Col, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserOutlined, UnorderedListOutlined, AppstoreOutlined as GridIcon, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import '../styles/components/project-card.css';
import { Project } from '../types/project';
import { projectService } from '../services/projectService';
import { notificationService } from '../services/notificationService';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import dayjs, { Dayjs } from 'dayjs';
import { SearchBar, TTSelect, TTDateRangePicker, TTButton, HeaderTitle, TTTable } from '../components/common';

const { Text } = Typography;

type ViewMode = 'list' | 'grid';

const ProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await projectService.list();
        if (!mounted) return;
        setProjects(data || []);
      } catch (e: any) {
        notificationService.error(e?.message || 'Failed to load projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!projects) return [] as Project[];
    let list = projects;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.key?.toLowerCase().includes(q) ?? false) ||
        (p.description?.toLowerCase().includes(q) ?? false) ||
        (p.owner?.name?.toLowerCase().includes(q) ?? false)
      );
    }
    if (status) {
      list = list.filter(p => (p.status || '').toLowerCase() === status.toLowerCase());
    }
    if (dateRange) {
      const [start, end] = dateRange;
      list = list.filter(p => {
        const created = p.createdAt ? dayjs(p.createdAt) : null;
        if (!created) return true;
        return created.isAfter(start.startOf('day')) && created.isBefore(end.endOf('day'));
      });
    }
    return list;
  }, [projects, query, status, dateRange]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await projectService.list();
      setProjects(data || []);
      setSelectedIds(new Set());
    } catch (e: any) {
      notificationService.error(e?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await projectService.bulkDelete(Array.from(selectedIds));
      notificationService.success('Deleted selected projects');
      await refresh();
    } catch (e: any) {
      notificationService.error(e?.message || 'Failed to delete projects');
    }
  };

  const handleCreate = async (payload: any) => {
    try {
      await projectService.create(payload);
      notificationService.success('Project created');
      setCreating(false);
      await refresh();
    } catch (e: any) {
      notificationService.error(e?.message || 'Failed to create project');
    }
  };

  return (
    <AppLayout title={<HeaderTitle level={3}>Projects</HeaderTitle>}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <HeaderTitle level={4}>All Projects</HeaderTitle>
              <Space className="tt-toolbar" align="center">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search projects..."
                  width={240}
                />
                <TTSelect
                  allowClear
                  placeholder="Status"
                  width={160}
                  value={status}
                  onChange={(v) => setStatus(v as string | undefined)}
                  options={[
                    { label: 'Active', value: 'ACTIVE' },
                    { label: 'On Hold', value: 'ON_HOLD' },
                    { label: 'Completed', value: 'COMPLETED' },
                  ]}
                />
                <TTDateRangePicker onChange={(v) => setDateRange(v as any)} />
                <TTButton icon={<UnorderedListOutlined />} type={viewMode === 'list' ? 'primary' : 'default'} onClick={() => setViewMode('list')} />
                <TTButton icon={<GridIcon />} type={viewMode === 'grid' ? 'primary' : 'default'} onClick={() => setViewMode('grid')} />
                <TTButton type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>New Project</TTButton>
              </Space>
            </Space>
            {selectedIds.size > 0 && (
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text type="secondary">Selected: {selectedIds.size}</Text>
                <Popconfirm title="Delete selected projects?" onConfirm={handleBulkDelete} okText="Delete" okButtonProps={{ danger: true }}>
                  <TTButton danger icon={<DeleteOutlined />}>Delete Selected</TTButton>
                </Popconfirm>
              </Space>
            )}
          </Space>
        </Card>

        <Card>
          {loading ? (
            <>
              <Skeleton active paragraph={{ rows: 2 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
            </>
          ) : (filtered && filtered.length > 0 ? (
            viewMode === 'list' ? (
              <ProjectsTable
                data={filtered}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            ) : (
              <Row gutter={[16, 16]}>
                {filtered.map(project => (
                  <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
                    <Card
                      className="project-grid-card"
                      title={
                        <Space>
                          <Checkbox
                            checked={selectedIds.has(project.id)}
                            onChange={(e) => toggleSelect(project.id, e.target.checked)}
                          />
                          <Link to={`/projects/${project.id}/dashboard`}>{project.name}</Link>
                        </Space>
                      }
                      extra={project.key ? <Tag color="blue">{project.key}</Tag> : undefined}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Avatar icon={<UserOutlined />} src={project.owner?.avatarUrl} />
                          <Text>{project.owner?.name || 'Unknown Owner'}</Text>
                        </Space>
                        {project.status ? (
                          <Tag color={project.status === 'ACTIVE' ? 'green' : project.status === 'COMPLETED' ? 'blue' : 'orange'}>
                            {project.status}
                          </Tag>
                        ) : null}
                        <Text type="secondary">{project.description || 'No description'}</Text>
                        <Link to={`/projects/${project.id}/dashboard`}>Open Dashboard</Link>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            )
          ) : (
            <Empty description="No projects found" />
          ))}
        </Card>

        <CreateProjectModal open={creating} onCancel={() => setCreating(false)} onCreate={handleCreate} />
      </Space>
    </AppLayout>
  );
};

export default ProjectsListPage;

// Inline table component to provide headers and alignment in list view
const ProjectsTable: React.FC<{
  data: Project[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
}> = ({ data, selectedIds, onToggleSelect }) => {
  const columns: ColumnsType<Project> = [
    {
      title: '',
      dataIndex: 'select',
      width: 48,
      align: 'center',
      render: (_: any, record) => (
        <Checkbox
          checked={selectedIds.has(record.id)}
          onChange={(e) => onToggleSelect(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: 'Project',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record) => (
        <Space size={8} wrap>
          <Avatar size="small" icon={<UserOutlined />} src={record.owner?.avatarUrl} />
          <Link to={`/projects/${record.id}/dashboard`}>{record.name}</Link>
          {record.key ? <Tag color="blue">{record.key}</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center' as const,
      render: (status?: string) =>
        status ? (
          <Tag color={status === 'ACTIVE' ? 'green' : status === 'COMPLETED' ? 'blue' : 'orange'}>
            {status}
          </Tag>
        ) : null,
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      width: 220,
      render: (_: any, record) => record.owner?.name || 'Unknown Owner',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      align: 'center' as const,
      render: (d?: string) => (d ? new Date(d).toLocaleDateString() : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      align: 'right' as const,
      render: (_: any, record) => (
        <Link to={`/projects/${record.id}/dashboard`}>Open Dashboard</Link>
      ),
    },
  ];

  return (
    <TTTable
      rowKey={(r) => r.id}
      columns={columns}
      dataSource={data}
      pagination={false}
      dense
    />
  );
};
