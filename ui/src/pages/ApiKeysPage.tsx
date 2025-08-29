import React from "react";
import { Card, Typography } from "antd";
import ApiKeyList from "../components/apikeys/ApiKeyList";
import GenerateKeyModal from "../components/apikeys/GenerateKeyModal";

const ApiKeysPage: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [lastCreatedId, setLastCreatedId] = React.useState<string | null>(null);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <Typography.Title level={3}>API Keys</Typography.Title>
      <Typography.Paragraph type="secondary">
        Manage personal API keys for programmatic access. You can generate new keys, copy them,
        and delete keys you no longer need. Keep keys secret.
      </Typography.Paragraph>

      <Card>
        <ApiKeyList onGenerateClick={() => setOpen(true)} />
      </Card>

      <GenerateKeyModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(k) => setLastCreatedId(k.id)}
      />
    </div>
  );
};

export default ApiKeysPage;
