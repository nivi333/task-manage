import React, { useEffect, useState } from "react";
import { Card, Form, Input, Select, Button, Table, Space, Popconfirm, Tag } from "antd";
import { ApiOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { webhookService, WebhookDto } from "../../services/webhookService";
import { notificationService } from "../../services/notificationService";

const availableEvents = [
  "task.created",
  "task.updated",
  "task.deleted",
  "comment.created",
  "project.updated",
];

const columnsBuilder = (
  onDelete: (id: string) => void
) => [
  { title: "Callback URL", dataIndex: "callbackUrl", key: "callbackUrl" },
  { title: "Events", dataIndex: "events", key: "events", render: (events: string[]) => (
      <Space wrap>
        {events?.map((e) => (
          <Tag key={e}>{e}</Tag>
        ))}
      </Space>
    )
  },
  { title: "Active", dataIndex: "active", key: "active", render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag> },
  {
    title: "Actions",
    key: "actions",
    render: (_: any, record: WebhookDto) => (
      <Space>
        <Popconfirm
          title="Delete webhook?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => record.id && onDelete(record.id)}
        >
          <Button icon={<DeleteOutlined />} danger />
        </Popconfirm>
      </Space>
    ),
  },
];

const WebhookConfig: React.FC = () => {
  const [form] = Form.useForm<WebhookDto>();
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookDto[]>([]);

  const load = async () => {
    try {
      setListLoading(true);
      const data = await webhookService.list();
      setWebhooks(data);
    } catch (e: any) {
      notificationService.error(e?.response?.data?.message || "Failed to load webhooks");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (values: WebhookDto) => {
    try {
      setLoading(true);
      await webhookService.create({
        callbackUrl: values.callbackUrl,
        secret: values.secret,
        events: values.events || [],
        active: true,
      });
      notificationService.success("Webhook created");
      form.resetFields();
      load();
    } catch (e: any) {
      notificationService.error(e?.response?.data?.message || "Failed to create webhook");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await webhookService.delete(id);
      notificationService.success("Webhook deleted");
      load();
    } catch (e: any) {
      notificationService.error(e?.response?.data?.message || "Failed to delete webhook");
    }
  };

  return (
    <Card title={<span><ApiOutlined /> Webhook Configuration</span>}>
      <Form form={form} layout="vertical" onFinish={onCreate}>
        <Form.Item label="Callback URL" name="callbackUrl" rules={[{ required: true }, { type: "url", message: "Enter a valid URL" }]}>
          <Input placeholder="https://example.com/webhooks/task" />
        </Form.Item>
        <Form.Item label="Secret" name="secret" rules={[{ required: true, message: "Enter a secret" }]}>
          <Input.Password placeholder="Shared secret for signature validation" />
        </Form.Item>
        <Form.Item label="Events" name="events" rules={[{ required: true, message: "Select at least one event" }]}>
          <Select mode="multiple" options={availableEvents.map(e => ({ value: e, label: e }))} placeholder="Select events to trigger" />
        </Form.Item>
        <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={loading}>
          Create Webhook
        </Button>
      </Form>

      <div style={{ marginTop: 24 }}>
        <Table
          rowKey={(r) => r.id as string}
          loading={listLoading}
          dataSource={webhooks}
          columns={columnsBuilder(onDelete) as any}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </Card>
  );
};

export default WebhookConfig;
