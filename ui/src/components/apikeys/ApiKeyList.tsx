import React from "react";
import { Table, Tag, Button, Popconfirm, Space, Typography, Empty } from "antd";
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { apiKeyService, ApiKeyModel } from "../../services/apiKeyService";
import { notificationService } from "../../services/notificationService";

interface Props {
  onGenerateClick: () => void;
}

const ApiKeyList: React.FC<Props> = ({ onGenerateClick }) => {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<ApiKeyModel[]>([]);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const list = await apiKeyService.list();
      setItems(list);
    } catch (e) {
      notificationService.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (id: string) => {
    try {
      await apiKeyService.delete(id);
      notificationService.success("API key deleted");
      setItems((prev) => prev.filter((k) => k.id !== id));
    } catch (e) {
      notificationService.error("Failed to delete API key");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (v: string) => <Typography.Text strong>{v}</Typography.Text>,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>{active ? "Active" : "Revoked"}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (ts: string) => new Date(ts).toLocaleString(),
    },
    {
      title: "Usage",
      key: "usage",
      render: () => <span style={{ color: "#888" }}>—</span>, // Placeholder until backend exposes usage stats
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, row: ApiKeyModel) => (
        <Space>
          <Popconfirm title="Delete this API key?" onConfirm={() => onDelete(row.id)}>
            <Button danger size="small" icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={onGenerateClick}>
          Generate API Key
        </Button>
        <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={columns as any}
        locale={{ emptyText: <Empty description="No API keys yet" /> }}
      />
    </div>
  );
};

export default ApiKeyList;
