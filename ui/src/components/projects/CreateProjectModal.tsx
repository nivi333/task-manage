import React, { useEffect, useMemo, useState } from "react";
import { Drawer, Form, Input, DatePicker, Select, Tag } from "antd";
import { TTButton } from "../common";
import dayjs from "dayjs";
import { ProjectCreateRequest } from "../../types/project";
import { userService } from "../../services/userService";
import { User } from "../../types/user";

export interface CreateProjectModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (payload: ProjectCreateRequest) => Promise<void> | void;
  /**
   * Existing project names for uniqueness validation (case-insensitive).
   * Optional: if omitted, uniqueness validation is skipped.
   */
  existingNames?: string[];
}

const { RangePicker } = DatePicker;

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onCancel,
  onCreate,
  existingNames,
}) => {
  const [form] = Form.useForm<
    ProjectCreateRequest & { dateRange?: [dayjs.Dayjs, dayjs.Dayjs] }
  >();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  const userOptions = useMemo(
    () =>
      allUsers.map((u) => ({ label: u.username, value: u.id })),
    [allUsers]
  );

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

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
        // Preselect current user so their username appears in chips.
        form.setFieldsValue({ memberIds: profile.id ? [profile.id] : [] } as any);
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: ProjectCreateRequest = {
        key: values.key?.trim() || undefined,
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        status: values.status || "ACTIVE",
        startDate: values.dateRange?.[0]?.toISOString(),
        endDate: values.dateRange?.[1]?.toISOString(),
        memberIds: Array.from(
          new Set<string>([
            ...(values.memberIds || []),
            ...(currentUserId ? [currentUserId] : []),
          ])
        ),
      };
      await onCreate(payload);
    } catch {
      // validation errors are shown by antd
    }
  };

  return (
    <Drawer
      title="Create Project"
      width="40%"
      onClose={onCancel}
      open={open}
      className="tt-modal-tight"
      bodyStyle={{ padding: "12px 16px 16px" }}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <TTButton onClick={onCancel}>Cancel</TTButton>
          <TTButton onClick={handleOk} type="primary">Create</TTButton>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        autoComplete="off"
        initialValues={{
          key: "",
          name: "",
          description: "",
          dateRange: undefined,
          status: "ACTIVE",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Form.Item
            label="Project Key"
            name="key"
            tooltip="Short code like TT"
            style={{ marginBottom: 8 }}
          >
            <Input
              maxLength={12}
              placeholder="e.g. TT"
              autoComplete="off"
              name="pm_key"
            />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter project name" },
              ({ getFieldValue }) => ({
                async validator() {
                  const value = (getFieldValue("name") || "").trim();
                  if (!value || !existingNames || existingNames.length === 0) return Promise.resolve();
                  const exists = existingNames.some((n) => n.toLowerCase() === value.toLowerCase());
                  return exists
                    ? Promise.reject(new Error("A project with this name already exists"))
                    : Promise.resolve();
                },
              }),
            ]}
            style={{ marginBottom: 8 }}
          >
            <Input placeholder="Project name" autoComplete="off" name="pm_name" />
          </Form.Item>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Form.Item
            label="Description"
            name="description"
            style={{ marginBottom: 8 }}
          >
            <Input.TextArea
              rows={3}
              placeholder="Optional description"
              autoComplete="off"
            />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            initialValue="ACTIVE"
            style={{ marginBottom: 8 }}
          >
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
            <Tag color="blue" style={{ marginRight: 0 }}>You will be added automatically</Tag>
          )}
        </div>
        <Form.Item name="memberIds" style={{ marginTop: 8, marginBottom: 8 }}>
          <Select
            mode="multiple"
            placeholder={loadingUsers ? "Loading users..." : "Select members"}
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

export default CreateProjectModal;
