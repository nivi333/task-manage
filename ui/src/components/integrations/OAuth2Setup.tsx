import React from "react";
import { Card, Space, Button, Tag } from "antd";
import { GoogleOutlined, GithubOutlined, LinkOutlined } from "@ant-design/icons";
import { oauth2Service } from "../../services/oauth2Service";
import { notificationService } from "../../services/notificationService";

const providers = [
  { key: "google", name: "Google", icon: <GoogleOutlined /> },
  { key: "github", name: "GitHub", icon: <GithubOutlined /> },
];

const OAuth2Setup: React.FC = () => {
  const handleConnect = async (provider: string) => {
    try {
      notificationService.info(`Redirecting to ${provider} authorization...`);
      await oauth2Service.startAuthorization(provider);
    } catch (e: any) {
      notificationService.error(
        e?.response?.data?.message || `Failed to start ${provider} authorization`
      );
    }
  };

  return (
    <Card title={<span><LinkOutlined /> OAuth2 Providers</span>}>
      <Space direction="vertical" style={{ width: "100%" }}>
        {providers.map((p) => (
          <div key={p.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space>
              {p.icon}
              <span>{p.name}</span>
              <Tag color="default">Not connected</Tag>
            </Space>
            <Button type="primary" onClick={() => handleConnect(p.key)}>Connect</Button>
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default OAuth2Setup;
