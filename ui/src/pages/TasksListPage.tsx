import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, DatePicker, Form, Input, Modal, Select, Table, Tag, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Link, useNavigate } from 'react-router-dom';
import { Task, TaskListFilters } from '../types/task';
import { taskService } from '../services/taskService';
import Button from '../components/common/Button';
import dayjs from 'dayjs';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';

const { Title } = Typography;

const TasksListPage: React.FC = () => {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TaskListFilters>({ page: 0, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
  const [assigneeOptions, setAssigneeOptions] = useState<{label: string; value: string}[]>([]);

  // Quick create modal state
  const [qcOpen, setQcOpen] = useState(false);
  const [qcForm] = Form.useForm<{title: string; priority?: string; dueDate?: any}>();
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const page = await taskService.list(filters);
      setData(page.content);
      setTotal(page.totalElements);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, DONE: 0 } as any;
    for (const t of data) {
      if (t.status && counts[t.status] !== undefined) counts[t.status]! += 1;
    }
    return counts;
  }, [data]);

  const handleSearchUsers = async (q: string) => {
    const list = await userService.getUsers({ search: q, size: 10 } as any);
    setAssigneeOptions((list.users || []).map(u => ({ label: `${u.firstName} ${u.lastName} (${u.email})`, value: u.id! })));
  };

  const columns: ColumnsType<Task> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <Link to={`/tasks/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Select
          size="small"
          value={record.status}
          style={{ minWidth: 140 }}
          onChange={async (v) => {
            try {
              const updated = await taskService.update(record.id, { status: v });
              setData(prev => prev.map(t => (t.id === record.id ? { ...t, status: updated.status } : t)));
              notificationService.success('Status updated');
            } catch (e: any) {
              const msg = e?.response?.data?.message || 'Failed to update status';
              notificationService.error(msg);
            }
          }}
          options={[
            { label: 'Open', value: 'OPEN' },
            { label: 'In Progress', value: 'IN_PROGRESS' },
            { label: 'Done', value: 'DONE' },
          ]}
        />
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (d?: string) => (d ? new Date(d).toLocaleDateString() : '-')
    },
  ];

  const onChange = (pag: TablePaginationConfig, _filters: any, sorter: any) => {
    setFilters(f => ({
      ...f,
      page: (pag.current ? pag.current - 1 : 0),
      size: pag.pageSize || f.size || 10,
      sortBy: sorter?.field || f.sortBy,
      sortDir: sorter?.order === 'ascend' ? 'asc' : sorter?.order === 'descend' ? 'desc' : f.sortDir,
    }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Tasks</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => setQcOpen(true)}>Quick Create</Button>
          <Button variant="primary" onClick={() => navigate('/tasks/new')}>New Task</Button>
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
          <Tag color="default">Total: {total}</Tag>
          <Tag color="default">Open: {stats.OPEN}</Tag>
          <Tag color="blue">In Progress: {stats.IN_PROGRESS}</Tag>
          <Tag color="green">Done: {stats.DONE}</Tag>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="Search tasks"
            allowClear
            onSearch={(v) => setFilters(f => ({ ...f, search: v, page: 0 }))}
            style={{ width: 260 }}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 160 }}
            onChange={(v) => setFilters(f => ({ ...f, status: v || undefined, page: 0 }))}
            options={[
              { label: 'Open', value: 'OPEN' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Done', value: 'DONE' },
            ]}
          />
          <Select
            allowClear
            placeholder="Priority"
            style={{ width: 160 }}
            onChange={(v) => setFilters(f => ({ ...f, priority: v || undefined, page: 0 }))}
            options={[
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
            ]}
          />
          <Select
            allowClear
            showSearch
            placeholder="Assignee"
            style={{ width: 240 }}
            onSearch={handleSearchUsers}
            filterOption={false}
            onChange={(v) => setFilters(f => ({ ...f, assignedTo: (v as any) || undefined, page: 0 }))}
            options={assigneeOptions}
          />
          <DatePicker.RangePicker
            allowEmpty={[true, true]}
            onChange={(range) => {
              const [start, end] = range || [];
              setFilters(f => ({
                ...f,
                dueDateFrom: start ? dayjs(start).startOf('day').toISOString() : undefined,
                dueDateTo: end ? dayjs(end).endOf('day').toISOString() : undefined,
                page: 0,
              }));
            }}
          />
        </div>
      </Card>

      <Card>
        <Table
          rowKey={(r) => r.id}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ current: (filters.page || 0) + 1, pageSize: filters.size || 10, total }}
          onChange={onChange}
        />
      </Card>

      <Modal
        title="Quick Create Task"
        open={qcOpen}
        onCancel={() => setQcOpen(false)}
        onOk={async () => {
          try {
            const v = await qcForm.validateFields();
            await taskService.create({
              title: v.title,
              priority: v.priority as any,
              dueDate: v.dueDate ? dayjs(v.dueDate).toISOString() : undefined,
            });
            notificationService.success('Task created');
            setQcOpen(false);
            qcForm.resetFields();
            fetchTasks();
          } catch (e: any) {
            const msg = e?.response?.data?.message || 'Failed to create task';
            notificationService.error(msg);
          }
        }}
      >
        <Form form={qcForm} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}> 
            <Input placeholder="Task title" />
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <Select allowClear options={[
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
            ]} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TasksListPage;
