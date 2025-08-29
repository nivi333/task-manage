import React from "react";
import { Modal, Form, Input } from "antd";
import { apiKeyService, ApiKeyModel } from "../../services/apiKeyService";
import { notificationService } from "../../services/notificationService";
import CopyButton from "./CopyButton";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (key: ApiKeyModel) => void;
}

const GenerateKeyModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const [createdKey, setCreatedKey] = React.useState<ApiKeyModel | null>(null);

  const handleOk = async () => {
    try {
      const { name } = await form.validateFields();
      setSubmitting(true);
      const created = await apiKeyService.generate(name);
      setCreatedKey(created);
      onCreated(created);
      notificationService.success("API key generated");
    } catch (e) {
      // validation or API error already notified
    } finally {
      setSubmitting(false);
    }
  };

  const handleAfterClose = () => {
    setCreatedKey(null);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title={createdKey ? "Your new API Key" : "Generate API Key"}
      onOk={createdKey ? onClose : handleOk}
      okText={createdKey ? "Done" : "Generate"}
      confirmLoading={submitting}
      onCancel={onClose}
      afterClose={handleAfterClose}
      destroyOnClose
    >
      {createdKey ? (
        <div>
          <p>Copy and store this key securely. You won't be able to view it again.</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Input readOnly value={createdKey.apiKey} />
            <CopyButton value={createdKey.apiKey} size="middle" />
          </div>
          <p style={{ marginTop: 12, color: "#888" }}>Name: {createdKey.name}</p>
        </div>
      ) : (
        <Form layout="vertical" form={form} initialValues={{ name: "" }}>
          <Form.Item
            label="Key Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name for this key" }]}
          >
            <Input placeholder="e.g. CI key, Mobile app key" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default GenerateKeyModal;
