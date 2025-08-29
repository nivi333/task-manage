import React from "react";
import { Drawer, Divider, Typography, Space, Button } from "antd";
import FAQSection from "./FAQSection";
import DocsLink from "./DocsLink";
import BugReportForm from "./BugReportForm";
import { BookOutlined, FileTextOutlined, QuestionCircleOutlined, RocketOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export interface HelpDrawerProps {
  open: boolean;
  onClose: () => void;
}

const HelpDrawer: React.FC<HelpDrawerProps> = ({ open, onClose }) => {
  const faqItems = [
    {
      question: "How do I create a new task?",
      answer: (
        <Paragraph>
          Use the Tasks section and click <Text strong>Create</Text>. Fill in required fields like title and project. You can also access it directly at <Text code>/tasks/create</Text>.
        </Paragraph>
      ),
    },
    {
      question: "How do notifications work?",
      answer: (
        <Paragraph>
          Enable push notifications in your browser and ensure you are logged in. We use a service worker and your subscription token to deliver updates.
        </Paragraph>
      ),
    },
    {
      question: "Can I use the app offline?",
      answer: (
        <Paragraph>
          Yes. The PWA caches core assets for offline use. You'll see an <Text strong>Offline</Text> banner when disconnected. Some actions may be queued until you are online.
        </Paragraph>
      ),
    },
    {
      question: "How can I adjust accessibility settings?",
      answer: (
        <Paragraph>
          Use the floating accessibility button to change font size, reduce motion, and enable high contrast mode.
        </Paragraph>
      ),
    },
  ];

  return (
    <Drawer
      className="tt-help-drawer tt-modal-tight"
      title={
        <Space size={8} style={{ display: "flex", alignItems: "center" }}>
          <QuestionCircleOutlined />
          <span>Help & Documentation</span>
        </Space>
      }
      width="40%"
      open={open}
      onClose={onClose}
      destroyOnClose
      bodyStyle={{ padding: 0, paddingBottom: 16 }}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="tt-help-drawer__body tt-form-compact" style={{ padding: "24px 32px", display: "grid", gap: 16 }}>
        <section>
          <Title level={5} style={{ marginBottom: 8 }}>Report a Bug</Title>
          <Paragraph type="secondary" style={{ marginTop: 0 }}>
            Found an issue? Submit a quick report and we'll take a look.
          </Paragraph>
          <BugReportForm />
        </section>

        <Divider className="tt-help-drawer__divider" />

        <section>
          <Title level={5} style={{ marginBottom: 8 }}>FAQs</Title>
          <FAQSection items={faqItems} />
        </section>

        <Divider className="tt-help-drawer__divider" />

        <section>
          <Title level={5} style={{ marginBottom: 8 }}>Useful Links</Title>
          <Space direction="vertical" size={8}>
            <DocsLink href="https://github.com/nivi333/task-manage#readme" label="Project README" icon={<BookOutlined />} />
            <DocsLink href="https://github.com/nivi333/task-manage/blob/main/UI-Screen-Development-Guide.md" label="UI Screen Development Guide" icon={<FileTextOutlined />} />
            <DocsLink href="https://github.com/nivi333/task-manage/blob/main/docs/deployment-guide.md" label="Deployment Guide" icon={<RocketOutlined />} />
            <DocsLink href="https://github.com/nivi333/task-manage/blob/main/docs/api-examples.md" label="API Examples" icon={<FileTextOutlined />} />
          </Space>
        </section>
      </div>
    </Drawer>
  );
};

export default HelpDrawer;
