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
      style={{ minWidth: 350 }}
    >
      <Form.Item
        label="Team Name"
        name="name"
        rules={[
          { required: true, message: "Please enter a team name" },
          { min: 3, message: "Team name must be at least 3 characters" },
        ]}
      >
        <Input placeholder="e.g. Platform Engineering" />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <Input.TextArea rows={3} placeholder="Optional description" />
      </Form.Item>
      <div style={{ display: "flex", gap: 12 }}>
        <Button htmlType="submit" type="primary">
          Create Team
        </Button>
        <Button onClick={typeof onCancel === "function" ? onCancel : undefined}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default TeamForm;
