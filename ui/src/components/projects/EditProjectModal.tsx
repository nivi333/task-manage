import React, { useEffect, useMemo } from "react";
import { Modal, Form, Input, DatePicker, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { TTButton } from "../common";
import dayjs from "dayjs";
import { Project, ProjectUpdateRequest } from "../../types/project";

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
      } as any);
    }
    if (!open) {
      form.resetFields();
    }
  }, [open, project, form]);

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
      };
      await onUpdate(project.id, payload);
    } catch {
      // validation errors handled by antd
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
            Edit Project
          </span>
          <TTButton
            type="text"
            aria-label="Close"
            onClick={onCancel}
            style={{ margin: 0, padding: 4, lineHeight: 1, fontSize: 18, width: 32, height: 32 }}
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
        <TTButton key="save" type="primary" onClick={handleOk}>
          Save Changes
        </TTButton>,
      ]}
      width={560}
      destroyOnHidden
      forceRender={false}
      styles={{ header: { padding: 12 }, body: { padding: 12 }, footer: { padding: 10 } }}
    >
      <Form form={form} layout="vertical" requiredMark={false} autoComplete="off">
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
        <Form.Item label="Description" name="description" style={{ marginBottom: 8 }}>
          <Input.TextArea rows={3} placeholder="Optional description" autoComplete="off" />
        </Form.Item>
        <Form.Item label="Dates" name="dateRange" style={{ marginBottom: 8 }}>
          <RangePicker style={{ width: "100%" }} />
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
      </Form>
    </Modal>
  );
};

export default EditProjectModal;
