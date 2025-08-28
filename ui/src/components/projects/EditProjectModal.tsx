import React, { useEffect, useMemo, useState } from "react";
import { Drawer, Form, Input, DatePicker, Select, Tag, Space } from "antd";
import { TTButton } from "../common";
import dayjs from "dayjs";
import { Project, ProjectUpdateRequest } from "../../types/project";
import { userService } from "../../services/userService";
import { User } from "../../types/user";

const { RangePicker } = DatePicker;

export interface EditProjectModalProps {
  open: boolean;
  project: Project | null;
  onCancel: () => void;
  onUpdate: (id: string, payload: ProjectUpdateRequest) => Promise<void> | void;
  /** Existing project names for uniqueness validation (exclude current). */
  existingNames?: string[];
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  open,
  project,
  onCancel,
  onUpdate,
  existingNames,
}) => {
  const [form] = Form.useForm<
    ProjectUpdateRequest & { dateRange?: [dayjs.Dayjs, dayjs.Dayjs] }
  >();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  const existingMemberIds = useMemo(() => {
    const memberIdsFromObjects = (project?.members || []).map((m) => m.id);
    const ids = (project?.teamMemberIds as string[] | undefined) || memberIdsFromObjects;
    return ids || [];
  }, [project?.members, project?.teamMemberIds]);

  const userOptions = useMemo(() => {
    return allUsers.map((u) => ({ label: u.username, value: u.id }));
  }, [allUsers]);

  const uniquePool = useMemo(() => {
    const current = (project?.name || "").toLowerCase();
    return (existingNames || []).filter((n) => n.toLowerCase() !== current);
  }, [existingNames, project?.name]);

  useEffect(() => {
    if (open && project) {
      form.setFieldsValue({
        key: project.key || "",
        name: project.name || "",
        description: project.description || "",
        dateRange:
          project.startDate && project.endDate
            ? [dayjs(project.startDate), dayjs(project.endDate)]
            : undefined,
        status: project.status || "ACTIVE",
        // Initialize with existing members so users can add/remove directly
        memberIds: existingMemberIds || [],
      } as any);
    }
    if (!open) {
      form.resetFields();
    }
  }, [open, project, form]);

  useEffect(() => {
    const load = async () => {
      if (!open) return;
      setLoadingUsers(true);
      try {
        const [profile, users] = await Promise.all([
          userService.getProfile(),
          userService.getUsersForTeams(),
        ]);
        setCurrentUserId(profile.id);
        const exists = users.some((u) => u.id === profile.id);
        setAllUsers(exists ? users : [...users, profile as any as User]);
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project?.id]);

  const handleOk = async () => {
    if (!project) return;
    try {
      const values = await form.validateFields();
      const payload: ProjectUpdateRequest = {
        key: values.key?.trim() || undefined,
        name: values.name?.trim() || undefined,
        description: values.description?.trim() || undefined,
        status: values.status || undefined,
        startDate: values.dateRange?.[0]?.toISOString(),
        endDate: values.dateRange?.[1]?.toISOString(),
        memberIds: Array.from(
          new Set<string>([...((values.memberIds as string[] | undefined) || []), ...(currentUserId ? [currentUserId] : [])])
        ),
      };
      await onUpdate(project.id, payload);
    } catch {
      // validation errors handled by antd
    }
  };

  return (
    <Drawer
      title="Edit Project"
      width="40%"
      onClose={onCancel}
      open={open}
      className="tt-modal-tight"
      bodyStyle={{ padding: "12px 16px 16px" }}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <TTButton onClick={onCancel}>Cancel</TTButton>
          <TTButton type="primary" onClick={handleOk}>Save Changes</TTButton>
        </div>
      }
    >
      <Form form={form} layout="vertical" requiredMark={false} autoComplete="off">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Form.Item label="Project Key" name="key" tooltip="Short code like TT" style={{ marginBottom: 8 }}>
            <Input maxLength={12} placeholder="e.g. TT" autoComplete="off" name="pm_key" />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter project name" },
              ({ getFieldValue }) => ({
                async validator() {
                  const value = (getFieldValue("name") || "").trim();
                  if (!value || !uniquePool || uniquePool.length === 0) return Promise.resolve();
                  const exists = uniquePool.some((n) => n.toLowerCase() === value.toLowerCase());
                  return exists ? Promise.reject(new Error("A project with this name already exists")) : Promise.resolve();
                },
              }),
            ]}
            style={{ marginBottom: 8 }}
          >
            <Input placeholder="Project name" autoComplete="off" name="pm_name" />
          </Form.Item>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Form.Item label="Description" name="description" style={{ marginBottom: 8 }}>
            <Input.TextArea rows={3} placeholder="Optional description" autoComplete="off" />
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="ACTIVE" style={{ marginBottom: 8 }}>
            <Select
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "On Hold", value: "ON_HOLD" },
                { label: "Completed", value: "COMPLETED" },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item label="Dates" name="dateRange" style={{ marginBottom: 8 }}>
          <RangePicker style={{ width: "100%" }} />
        </Form.Item>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 500 }}>Members</span>
          {currentUserId && (
            <Tag color="blue" style={{ marginRight: 0 }}>You are a member</Tag>
          )}
        </div>
        <Form.Item name="memberIds" style={{ marginTop: 8, marginBottom: 8 }}>
          <Select
            mode="multiple"
            placeholder={loadingUsers ? "Loading users..." : "Add or remove members"}
            options={userOptions}
            loading={loadingUsers}
            optionLabelProp="label"
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditProjectModal;
