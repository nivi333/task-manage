import React from "react";
import { Modal, Divider, Typography, Space } from "antd";
import FAQSection from "./FAQSection";
import DocsLink from "./DocsLink";
import { BookOutlined, FileTextOutlined, QuestionCircleOutlined, RocketOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
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
    <Modal
      title={
        <Space>
          <QuestionCircleOutlined />
          <span>Help & Documentation</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="Close"
      cancelButtonProps={{ style: { display: "none" } }}
      width={720}
    >
      <div className="tt-form-compact" style={{ display: "grid", gap: 16 }}>
        <section>
          <Title level={5} style={{ marginBottom: 8 }}>FAQs</Title>
          <FAQSection items={faqItems} />
        </section>

        <Divider style={{ margin: "8px 0" }} />

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
    </Modal>
  );
};

export default HelpModal;
