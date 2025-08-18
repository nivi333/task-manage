import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, DatePicker, Form, Row, Select, Spin, Typography, Divider, Space, Button } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Pie, Column } from '@ant-design/plots';
import { TaskListFilters, TaskPriority } from '../types/task';
import { taskService } from '../services/taskService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUSES = [
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
];

const PRIORITIES: { label: string; value: TaskPriority }[] = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

function toISODate(d?: Dayjs | null) {
  return d ? d.startOf('day').toISOString() : undefined;
}

const defaultFilters: TaskListFilters = {
  sortBy: 'createdAt',
  sortDir: 'desc',
  page: 0,
  size: 1, // we only need counts
};

export const TasksStatsPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({ OPEN: 0, IN_PROGRESS: 0, DONE: 0 });
  const [priorityCounts, setPriorityCounts] = useState<Record<TaskPriority, number>>({ HIGH: 0, MEDIUM: 0, LOW: 0 });
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueSoonCount, setDueSoonCount] = useState(0);

  const [filters, setFilters] = useState<TaskListFilters>({ ...defaultFilters });

  const refresh = async (f: TaskListFilters) => {
    setLoading(true);
    try {
      // Status counts (3 calls)
      const statusPromises = STATUSES.map(s => taskService.list({ ...f, status: s.value, page: 0, size: 1 }));
      // Priority counts (3 calls)
      const priorityPromises = PRIORITIES.map(p => taskService.list({ ...f, priority: p.value, page: 0, size: 1 }));

      // Overdue (dueDateTo yesterday)
      const yesterday = dayjs().subtract(1, 'day').endOf('day').toISOString();
      const overduePromise = taskService.list({ ...f, dueDateTo: yesterday, page: 0, size: 1 });

      // Due soon (today to +7 days)
      const todayIso = dayjs().startOf('day').toISOString();
      const in7Iso = dayjs().add(7, 'day').endOf('day').toISOString();
      const dueSoonPromise = taskService.list({ ...f, dueDateFrom: todayIso, dueDateTo: in7Iso, page: 0, size: 1 });

      const [statusRes, priorityRes, overdueRes, dueSoonRes] = await Promise.all([
        Promise.all(statusPromises),
        Promise.all(priorityPromises),
        overduePromise,
        dueSoonPromise,
      ]);

      const sCounts: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, DONE: 0 };
      STATUSES.forEach((s, idx) => (sCounts[s.value] = statusRes[idx].totalElements || 0));
      setStatusCounts(sCounts);

      const pCounts: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 } as any;
      PRIORITIES.forEach((p, idx) => (pCounts[p.value] = priorityRes[idx].totalElements || 0));
      setPriorityCounts(pCounts);

      setOverdueCount(overdueRes.totalElements || 0);
      setDueSoonCount(dueSoonRes.totalElements || 0);
    } catch (e) {
      // Fail silently; notifications handled globally by axios interceptor/notificationService
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusPieData = useMemo(() => [
    { type: 'Open', value: statusCounts.OPEN || 0 },
    { type: 'In Progress', value: statusCounts.IN_PROGRESS || 0 },
    { type: 'Done', value: statusCounts.DONE || 0 },
  ], [statusCounts]);

  const priorityBarData = useMemo(() => [
    { priority: 'High', count: priorityCounts.HIGH || 0 },
    { priority: 'Medium', count: priorityCounts.MEDIUM || 0 },
    { priority: 'Low', count: priorityCounts.LOW || 0 },
  ], [priorityCounts]);

  const dueSplitPieData = useMemo(() => [
    { type: 'Overdue', value: overdueCount },
    { type: 'Due in 7 days', value: dueSoonCount },
  ], [overdueCount, dueSoonCount]);

  const onApplyFilters = () => {
    const values = form.getFieldsValue();
    const range: [Dayjs, Dayjs] | undefined = values.dueRange;
    const next: TaskListFilters = {
      ...filters,
      status: values.status || undefined,
      priority: values.priority || undefined,
      assignedTo: values.assignedTo || undefined,
      dueDateFrom: range?.[0] ? toISODate(range[0]) : undefined,
      dueDateTo: range?.[1] ? range[1].endOf('day').toISOString() : undefined,
      page: 0,
      size: 1,
    };
    setFilters(next);
    refresh(next);
  };

  const onReset = () => {
    form.resetFields();
    const next = { ...defaultFilters };
    setFilters(next);
    refresh(next);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Task Statistics</Title>
        <Space>
          <Button onClick={() => navigate('/tasks')}>View List</Button>
          <Button onClick={() => navigate('/tasks/board')}>View Board</Button>
        </Space>
      </Space>

      <Card style={{ marginTop: 16 }}>
        <Form form={form} layout="inline" onFinish={onApplyFilters}>
          <Form.Item name="status" label="Status">
            <Select allowClear placeholder="All" style={{ width: 160 }} options={STATUSES} />
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <Select allowClear placeholder="All" style={{ width: 160 }} options={PRIORITIES} />
          </Form.Item>
          <Form.Item name="dueRange" label="Due Date">
            <RangePicker allowEmpty={[true, true]} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button htmlType="submit" type="primary">Apply</Button>
              <Button onClick={onReset}>Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Card title={<Text strong>Tasks by Status</Text>}>
              <Pie
                data={statusPieData}
                angleField="value"
                colorField="type"
                radius={0.9}
                label={{ text: 'value', style: { fontSize: 12 } }}
                interactions={[{ type: 'element-active' }]}
                legend={{ position: 'bottom' }}
                emptyContent={{ text: 'No data' }}
              />
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card title={<Text strong>Tasks by Priority</Text>}>
              <Column
                data={priorityBarData}
                xField="priority"
                yField="count"
                label={{ text: 'count' }}
                axis={{ x: { labelAutoRotate: true }, y: { nice: true } }}
                emptyContent={{ text: 'No data' }}
              />
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card title={<Text strong>Due Attention</Text>}>
              <Pie
                data={dueSplitPieData}
                angleField="value"
                colorField="type"
                innerRadius={0.6}
                label={{ text: 'value' }}
                legend={{ position: 'bottom' }}
                emptyContent={{ text: 'No data' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default TasksStatsPage;
