import React from "react";
import { Tabs, Row, Col } from "antd";
import IntegrationList from "../components/integrations/IntegrationList";
import OAuth2Setup from "../components/integrations/OAuth2Setup";
import CalendarSync from "../components/integrations/CalendarSync";
import WebhookConfig from "../components/integrations/WebhookConfig";

const IntegrationSettingsPage: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <IntegrationList />
        </Col>
        <Col xs={24}>
          <Tabs
            defaultActiveKey="oauth2"
            items={[
              { key: "oauth2", label: "OAuth2", children: <OAuth2Setup /> },
              { key: "calendar", label: "Calendar", children: <CalendarSync /> },
              { key: "webhooks", label: "Webhooks", children: <WebhookConfig /> },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default IntegrationSettingsPage;
