import React from "react";
import { Card, List, Tag } from "antd";
import { ApiOutlined, CloudSyncOutlined, LinkOutlined } from "@ant-design/icons";

const data = [
  {
    key: "oauth2",
    title: "OAuth2 Providers",
    description: "Connect Google or GitHub to enable calendar and repository workflows.",
    icon: <LinkOutlined />,
    status: "Not connected",
  },
  {
    key: "calendar",
    title: "Calendar Integration",
    description: "Create events in your connected calendar.",
    icon: <CloudSyncOutlined />,
    status: "Configured",
  },
  {
    key: "webhooks",
    title: "Webhooks",
    description: "Receive event callbacks to your server for automation.",
    icon: <ApiOutlined />,
    status: "Active",
  },
];

const IntegrationList: React.FC = () => {
  return (
    <Card title="Integrations Overview">
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<span style={{ fontSize: 18 }}>{item.icon}</span>}
              title={item.title}
              description={item.description}
            />
            <Tag>{item.status}</Tag>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default IntegrationList;
