import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { TTButton } from "../common";
import dayjs from "dayjs";
import { ProjectCreateRequest } from "../../types/project";

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

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

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
      };
      await onCreate(payload);
    } catch {
      // validation errors are shown by antd
    }
  };

  return (
    <Modal
      title={
        <>
          <span
            style={{
              margin: 0,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              paddingRight: 8,
            }}
          >
            Create Project
          </span>
          <TTButton
            type="text"
            aria-label="Close"
            onClick={onCancel}
            style={{
              margin: 0,
              padding: 4,
              lineHeight: 1,
              fontSize: 18,
              width: 32,
              height: 32,
            }}
            icon={<CloseOutlined style={{ fontSize: 18 }} />}
          />
        </>
      }
      open={open}
      onCancel={onCancel}
      closable={false}
      rootClassName="tt-compact-modal"
      footer={[
        <TTButton key="cancel" onClick={onCancel}>
          Cancel
        </TTButton>,
        <TTButton key="create" type="primary" onClick={handleOk}>
          Create
        </TTButton>,
      ]}
      width={560}
      destroyOnHidden
      forceRender={false}
      styles={{
        header: { padding: 12 },
        body: { padding: 12 },
        footer: { padding: 10 },
      }}
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
        <Form.Item label="Dates" name="dateRange" style={{ marginBottom: 8 }}>
          <RangePicker style={{ width: "100%" }} />
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
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;
