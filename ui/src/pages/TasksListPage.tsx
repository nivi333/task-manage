import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Table,
  Tag,
  Typography,
} from "antd";
import TTSelect from "../components/common/TTSelect";
import { Drawer, Space } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Task, TaskListFilters } from "../types/task";
import { taskService } from "../services/taskService";
import { TTButton } from "../components/common";
import TaskForm from "../components/tasks/TaskForm";
import dayjs from "dayjs";
import { notificationService } from "../services/notificationService";
import { userService } from "../services/userService";
import AppLayout from "../components/layout/AppLayout";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;

const TasksListPage: React.FC = () => {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TaskListFilters>({
    page: 0,
    size: 10,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [assigneeOptions, setAssigneeOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Quick create modal state
  const [qcOpen, setQcOpen] = useState(false);
  const [qcForm] = Form.useForm<{
    title: string;
    priority?: string;
    dueDate?: any;
  }>();
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerSubmit, setDrawerSubmit] = useState<(() => void) | null>(null);
  const handleRegisterSubmit = useCallback((fn: () => void) => {
    // Memoized to avoid changing identity each render which triggers child useEffect
    setDrawerSubmit(() => fn);
  }, []);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Open drawer if ?create=1 is present
  useEffect(() => {
    const shouldOpen = searchParams.get("create") === "1";
    setCreateOpen(!!shouldOpen);
  }, [searchParams]);

  const openCreate = () =>
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("create", "1");
      return p;
    });

  const closeCreate = () => {
    // Close immediately for responsive UX, then sync URL
    setCreateOpen(false);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete("create");
      return p;
    });
  };

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
    const counts: Record<string, number> = {
      OPEN: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    } as any;
    for (const t of data) {
      if (t.status && counts[t.status] !== undefined) counts[t.status]! += 1;
    }
    return counts;
  }, [data]);

  const handleSearchUsers = async (q: string) => {
    const list = await userService.getUsers({ search: q, size: 10 } as any);
    setAssigneeOptions(
      (list.users || []).map((u) => ({
        label: `${u.firstName} ${u.lastName} (${u.email})`,
        value: u.id!,
      }))
    );
  };

  const columns: ColumnsType<Task> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => <Link to={`/tasks/${record.id}`}>{text}</Link>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <TTSelect
          size="small"
          value={record.status}
          style={{ minWidth: 140 }}
          onChange={async (v) => {
            try {
              const updated = await taskService.update(record.id, {
                status: v,
              });
              setData((prev) =>
                prev.map((t) =>
                  t.id === record.id ? { ...t, status: updated.status } : t
                )
              );
              notificationService.success("Status updated");
            } catch (e: any) {
              const msg =
                e?.response?.data?.message || "Failed to update status";
              notificationService.error(msg);
            }
          }}
          options={[
            { label: "Open", value: "OPEN" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Done", value: "DONE" },
          ]}
        />
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (d?: string) => (d ? new Date(d).toLocaleDateString() : "-"),
    },
  ];

  const onChange = (pag: TablePaginationConfig, _filters: any, sorter: any) => {
    setFilters((f) => ({
      ...f,
      page: pag.current ? pag.current - 1 : 0,
      size: pag.pageSize || f.size || 10,
      sortBy: sorter?.field || f.sortBy,
      sortDir:
        sorter?.order === "ascend"
          ? "asc"
          : sorter?.order === "descend"
          ? "desc"
          : f.sortDir,
    }));
  };

  return (
    <AppLayout title="Tasks" contentPadding={24}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, gap: 8 }}>
          <TTButton onClick={() => setQcOpen(true)}>
            Quick Create
          </TTButton>
          <TTButton type="primary" onClick={openCreate}>
            New Task
          </TTButton>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
            <Tag color="default">Total: {total}</Tag>
            <Tag color="default">Open: {stats.OPEN}</Tag>
            <Tag color="blue">In Progress: {stats.IN_PROGRESS}</Tag>
            <Tag color="green">Done: {stats.DONE}</Tag>
          </div>
          <div className="tt-filters" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Input
              className="tt-search-input"
              placeholder="Search tasks"
              allowClear
              prefix={<SearchOutlined />}
              onPressEnter={(e) =>
                setFilters((f) => ({ ...f, search: (e.target as HTMLInputElement).value, page: 0 }))
              }
              style={{ width: 320 }}
            />
            <TTSelect
              allowClear
              placeholder="Status"
              style={{ width: 160 }}
              onChange={(v) =>
                setFilters((f) => ({ ...f, status: v || undefined, page: 0 }))
              }
              options={[
                { label: "Open", value: "OPEN" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Done", value: "DONE" },
              ]}
            />
            <TTSelect
              allowClear
              placeholder="Priority"
              style={{ width: 160 }}
              onChange={(v) =>
                setFilters((f) => ({ ...f, priority: v || undefined, page: 0 }))
              }
              options={[
                { label: "Low", value: "LOW" },
                { label: "Medium", value: "MEDIUM" },
                { label: "High", value: "HIGH" },
              ]}
            />
            <TTSelect
              allowClear
              showSearch
              placeholder="Assignee"
              style={{ width: 240 }}
              onSearch={handleSearchUsers}
              filterOption={false}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  assignedTo: (v as any) || undefined,
                  page: 0,
                }))
              }
              options={assigneeOptions}
            />
            <DatePicker.RangePicker
              allowEmpty={[true, true]}
              onChange={(range) => {
                const [start, end] = range || [];
                setFilters((f) => ({
                  ...f,
                  dueDateFrom: start
                    ? dayjs(start).startOf("day").toISOString()
                    : undefined,
                  dueDateTo: end
                    ? dayjs(end).endOf("day").toISOString()
                    : undefined,
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
            pagination={{
              current: (filters.page || 0) + 1,
              pageSize: filters.size || 10,
              total,
            }}
            onChange={onChange}
          />
        </Card>

        {/* Inline Create Task Drawer */}
        <Drawer
          open={createOpen}
          placement="right"
          width="40vw"
          closable={false}
          mask={false}
          onClose={closeCreate}
          styles={{
            content: { background: "transparent", boxShadow: "none", borderRadius: 0 },
            header: {
              background: "transparent",
              borderBottom: "1px solid #f0f0f0",
              padding: 0,
              borderRadius: 0,
            },
            footer: { background: "transparent", borderTop: "1px solid #f0f0f0", padding: 0, borderRadius: 0 },
            body: { padding: "0px" },
          }}
          title={
            <div
              style={{
                background: "#fff",
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                padding: "12px 16px",
                // borders handled by Drawer header/footer now
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Space align="center">
                <TTButton
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={closeCreate}
                />
                <Title level={4} style={{ margin: 0 }}>
                  Create Task
                </Title>
              </Space>
            </div>
          }
          footer={
            <div
              style={{
                background: "#fff",
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                padding: "12px 16px",
                // borders handled by Drawer header/footer now
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <TTButton onClick={closeCreate}>Cancel</TTButton>
              <TTButton type="primary" onClick={() => drawerSubmit?.()}>
                Create
              </TTButton>
            </div>
          }
        >
          <div
            style={{
              background: "#fff",
              borderLeft: "1px solid #f0f0f0",
              borderRight: "1px solid #f0f0f0",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              padding: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <TaskForm
              mode="create"
              hideActions
              registerSubmit={handleRegisterSubmit}
              onSubmit={(task: any) => {
                closeCreate();
                fetchTasks(); // Refresh the table
                // Do NOT navigate to the detail page after creation

              }}
            />
          </div>
        </Drawer>

        <Modal
          title="Quick Create Task"
          open={qcOpen}
          onCancel={() => setQcOpen(false)}
          onOk={async () => {
            try {
              const v = await qcForm.validateFields();
              await taskService.create({
                title: v.title,
                status: "OPEN",
                priority: v.priority as any,
                dueDate: v.dueDate ? dayjs(v.dueDate).toISOString() : undefined,
              });
              notificationService.success("Task created");
              setQcOpen(false);
              qcForm.resetFields();
              fetchTasks();
            } catch (e: any) {
              const msg = e?.response?.data?.message || "Failed to create task";
              notificationService.error(msg);
            }
          }}
        >
          <Form form={qcForm} layout="vertical">
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input placeholder="Task title" />
            </Form.Item>
            <Form.Item name="priority" label="Priority">
              <TTSelect
                allowClear
                options={[
                  { label: "Low", value: "LOW" },
                  { label: "Medium", value: "MEDIUM" },
                  { label: "High", value: "HIGH" },
                ]}
              />
            </Form.Item>
            <Form.Item name="dueDate" label="Due Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>
    </AppLayout>
  );
};

export default TasksListPage;
