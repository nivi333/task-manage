import React, { useEffect, useMemo, useState } from "react";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Space,
  Upload,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { PlusOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import {
  Task,
  TaskCreateRequest,
  TaskPriority,
  TaskUpdateRequest,
  UUID,
} from "../../types/task";
import { userService } from "../../services/userService";
import { taskService } from "../../services/taskService";
import { notificationService } from "../../services/notificationService";
import { TTButton } from "../common";
import TTSelect from "../common/TTSelect";
import { projectService } from "../../services/projectService";

export type TaskFormValues = {
  title: string;
  description?: string;
  dueDate?: Dayjs;
  status: string;
  priority?: TaskPriority;
  assignedTo?: UUID;
  project?: { id: UUID };
  tags?: string[];
  dependencies?: { label: string; value: UUID }[];
  // Hours supported by backend
  estimatedHours?: number;
  actualHours?: number;
  // Recurrence kept in UI but not sent to backend (unsupported server-side)
  recurrence?: {
    frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";
    interval?: number;
    count?: number;
  } | null;
  attachments?: UploadFile[];
};

interface TaskFormProps {
  mode: "create" | "edit";
  initialTask?: Task;
  onSubmit?: (task: Task) => void;
  hideActions?: boolean;
  registerSubmit?: (fn: () => void) => void;
}

const priorities: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  initialTask,
  onSubmit,
  hideActions = false,
  registerSubmit,
}) => {
  const [form] = Form.useForm<TaskFormValues>();
  const [saving, setSaving] = useState(false);
  const [assigneeOptions, setAssigneeOptions] = useState<
    { label: string; value: UUID }[]
  >([]);
  const [depOptions, setDepOptions] = useState<
    { label: string; value: UUID }[]
  >([]);
  const [attachments, setAttachments] = useState<UploadFile[]>([]);
  const [projectOptions, setProjectOptions] = useState<
    { label: string; value: UUID }[]
  >([]);

  const initialValues: TaskFormValues = useMemo(
    () => ({
      title: initialTask?.title || "",
      description: initialTask?.description || "",
      dueDate: initialTask?.dueDate ? dayjs(initialTask.dueDate) : undefined,
      status: initialTask?.status || "OPEN",
      priority: initialTask?.priority as TaskPriority | undefined,
      assignedTo: initialTask?.assignedTo,
      project: initialTask?.project ? { id: initialTask.project.id } : undefined,
      tags: initialTask?.tags || [],
      dependencies: [],
      // Initialize hours from existing task if present
      estimatedHours: initialTask?.estimatedHours,
      actualHours: initialTask?.actualHours,
      recurrence: { frequency: "NONE", interval: undefined, count: undefined },
      attachments: [],
    }),
    [initialTask]
  );

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  useEffect(() => {
    if (registerSubmit) {
      registerSubmit(submit);
    }
  }, [registerSubmit]);

  const handleSearchUsers = async (q: string) => {
    try {
      // If query is empty, request first page without search to show initial options
      const list = await userService.getUsers(
        q ? ({ search: q, size: 10 } as any) : ({ size: 10 } as any)
      );
      setAssigneeOptions(
        (list.users || []).map((u) => ({
          label: `${u.firstName} ${u.lastName} (${u.email})`,
          value: u.id!,
        }))
      );
    } catch (e: any) {
      const code = e?.response?.status;
      if (code === 401) {
        notificationService.error("Your session expired. Please login again.");
      } else if (code === 403) {
        notificationService.info(
          "You don't have permission to list users. Assigning is limited."
        );
      } else {
        notificationService.error("Failed to search users");
      }
      setAssigneeOptions([]);
    }
  };

  const preloadProjects = async () => {
    try {
      const list = await projectService.list();
      setProjectOptions(
        (list || []).filter(Boolean).filter(p => p && p.id && p.name).map((p) => ({ label: p.name, value: p.id }))
      );
    } catch {
      setProjectOptions([]);
    }
  };

  const preloadUsers = async () => {
    try {
      const list = await userService.getUsers({ size: 10 } as any);
      setAssigneeOptions(
        (list.users || []).map((u) => ({
          label: `${u.firstName} ${u.lastName} (${u.email})`,
          value: u.id!,
        }))
      );
    } catch {
      setAssigneeOptions([]);
    }
  };

  const handleSearchTasks = async (q: string) => {
    const tasks = await taskService.search(q);
    setDepOptions(tasks.map((t) => ({ label: `${t.title}`, value: t.id })));
  };

  const toCreatePayload = (v: TaskFormValues): TaskCreateRequest => ({
    title: v.title,
    description: v.description,
    dueDate: v.dueDate ? v.dueDate.toISOString() : undefined,
    status: v.status,
    priority: v.priority,
    assignedTo: v.assignedTo,
    projectId: v.project?.id,
    tags: v.tags,
    // Hours now supported by backend DTO
    estimatedHours: v.estimatedHours,
    actualHours: v.actualHours,
    // Note: dependencyIds and recurrence intentionally not sent to backend to avoid unknown fields
  });

  const toUpdatePayload = (v: TaskFormValues): TaskUpdateRequest => ({
    ...toCreatePayload(v),
  });

  const submit = async () => {
    try {
      const values = await form.validateFields();
      // Extra safety: ensure assignedTo is a UUID when present
      if (values.assignedTo && !UUID_REGEX.test(String(values.assignedTo))) {
        notificationService.error("Assignee must be a valid user (UUID).");
        return;
      }
      setSaving(true);
      let result: Task;
      if (mode === "create") {
        const createPayload = toCreatePayload(values);
        result = await taskService.create(createPayload);
        notificationService.success("Task created");
      } else {
        const updatePayload = toUpdatePayload(values);
        result = await taskService.update(initialTask!.id, updatePayload);
        notificationService.success("Task updated");
      }
      onSubmit?.(result);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save task";
      notificationService.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      size="large"
      initialValues={initialValues}
      className="tt-form-compact"
    >
      <div style={{ color: "#999", fontSize: 12, marginBottom: 8 }}>
        * indicates required fields
      </div>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: "Title is required" }]}
      >
        <Input size="large" placeholder="Task title" maxLength={120} />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[
          {
            validator: (_, value) => {
              const text = (value ?? "").toString();
              if (!text) return Promise.resolve();
              if (text.length > 2000) {
                return Promise.reject(
                  new Error("Description must be 2000 characters or less.")
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input.TextArea rows={6} placeholder="Write a description..." />
      </Form.Item>

      <Form.Item name="dueDate" label="Due Date">
        <DatePicker size="large" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="estimatedHours" label="Estimated Hours">
        <InputNumber
          size="large"
          min={0}
          style={{ width: "100%" }}
          placeholder="e.g., 8"
        />
      </Form.Item>

      <Form.Item name="actualHours" label="Actual Hours">
        <InputNumber
          size="large"
          min={0}
          style={{ width: "100%" }}
          placeholder="e.g., 5"
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: "Status is required" }]}
      >
        <TTSelect allowClear placeholder="Select status" options={[
          { label: 'OPEN', value: 'OPEN' },
          { label: 'IN_PROGRESS', value: 'IN_PROGRESS' },
          { label: 'DONE', value: 'DONE' },
        ]} />
      </Form.Item>

      <Form.Item
        name="priority"
        label="Priority"
        rules={[{ required: true, message: "Priority is required" }]}
      >
        <TTSelect allowClear placeholder="Select priority" options={priorities.map(p => ({ label: p, value: p }))} />
      </Form.Item>

      <Form.Item
        name="assignedTo"
        label="Assignee"
        rules={[
          { required: true, message: "Assignee is required" },
          {
            validator: (_, v) => {
              if (!v) return Promise.resolve();
              return UUID_REGEX.test(String(v))
                ? Promise.resolve()
                : Promise.reject(new Error("Please select a valid user"));
            },
          },
        ]}
      >
        <TTSelect
          showSearch
          allowClear
          placeholder="Search users"
          onFocus={preloadUsers}
          onSearch={handleSearchUsers}
          filterOption={false}
          options={assigneeOptions}
        />
      </Form.Item>

      <Form.Item
        name={["project", "id"]}
        label="Project"
        rules={[{ required: true, message: "Project is required" }]}
      >
        <TTSelect
          allowClear={false}
          showSearch
          placeholder="Select a project"
          onFocus={preloadProjects}
          options={(projectOptions || []).filter(
            (opt) => opt && typeof opt.label === 'string' && typeof opt.value === 'string'
          )}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item name="tags" label="Tags">
        <TTSelect
          mode="tags"
          placeholder="Add tags"
          tokenSeparators={[","]}
        />
      </Form.Item>

      <Form.Item name="dependencies" label="Dependencies">
        <TTSelect
          mode="multiple"
          showSearch
          allowClear
          placeholder="Search tasks to add"
          onSearch={handleSearchTasks}
          filterOption={false}
          labelInValue
          options={depOptions}
        />
      </Form.Item>

      <Form.Item label="Attachments">
        <Upload
          multiple
          beforeUpload={() => false}
          fileList={attachments}
          onChange={({ fileList }) => setAttachments(fileList)}
          listType="picture-card"
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
        <div style={{ color: "#999", fontSize: 12 }}>
          Files are kept client-side; attach support can be wired to backend
          multipart later.
        </div>
      </Form.Item>

      <Form.Item label="Recurrence">
        <Space.Compact block className="recurrence-compact">
          <Form.Item name={["recurrence", "frequency"]} noStyle>
            <TTSelect
              style={{ flex: "0 0 40%" }}
              options={[
                { label: "None", value: "NONE" },
                { label: "Daily", value: "DAILY" },
                { label: "Weekly", value: "WEEKLY" },
                { label: "Monthly", value: "MONTHLY" },
              ]}
            />
          </Form.Item>
          <Form.Item name={["recurrence", "interval"]} noStyle>
            <InputNumber
              size="large"
              min={1}
              placeholder="Interval"
              style={{ flex: "0 0 30%" }}
            />
          </Form.Item>
          <Form.Item name={["recurrence", "count"]} noStyle>
            <InputNumber
              size="large"
              min={1}
              placeholder="Count"
              style={{ flex: "0 0 30%" }}
            />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      {!hideActions && (
        <Form.Item>
          <TTButton type="primary" onClick={submit} loading={saving}>
            {mode === "create" ? "Create Task" : "Update Task"}
          </TTButton>
        </Form.Item>
      )}
    </Form>
  );
};

export default TaskForm;
