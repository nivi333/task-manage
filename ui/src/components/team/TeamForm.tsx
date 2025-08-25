import React from "react";
import { Form, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { teamService } from "../../services/teamService";
import { Team } from "../../types/team";
import { notificationService } from "../../services/notificationService";

// Team creation form using global CSS classes only
const TeamForm: React.FC<{
  onCancel?: () => void;
  onSuccess?: (team: Team) => void;
}> = ({ onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { name: string; description?: string }) => {
    try {
      const payload: Partial<Team> = {
        name: values.name?.trim(),
        description: (values.description ?? "").trim(),
      } as any;
      const created = await teamService.createTeam(payload);
      notificationService.success("Team created successfully");
      if (typeof onSuccess === "function") {
        onSuccess(created);
      } else {
        // Fallback: remain within Teams area
        navigate("/teams");
      }
    } catch (e) {
      notificationService.error("Failed to create team");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ name: "", description: "" }}
      style={{ minWidth: 350, padding: 0 }}
    >
      <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 12, textAlign: 'left' }}>Create Team</div>
      <Form.Item
        label="Team Name"
        name="name"
        rules={[
          { required: true, message: "Please enter a team name" },
          { min: 3, message: "Team name must be at least 3 characters" },
        ]}
        style={{ marginBottom: 10 }}
      >
        <Input placeholder="e.g. Platform Engineering" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Description" name="description" style={{ marginBottom: 10 }}>
        <Input.TextArea rows={2} placeholder="Optional description" style={{ width: '100%' }} />
      </Form.Item>
      <div style={{ display: "flex", gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button htmlType="submit" type="primary" style={{ minWidth: 100 }}>
          Create Team
        </Button>
        <Button onClick={typeof onCancel === "function" ? onCancel : undefined} style={{ minWidth: 80 }}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default TeamForm;
