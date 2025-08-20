import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../../services/teamService';
import { Team } from '../../types/team';
import { notificationService } from '../../services/notificationService';

// Team creation form using global CSS classes only
const TeamForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { name: string; description?: string }) => {
    try {
      const payload: Partial<Team> = { name: values.name, description: values.description } as any;
      const created = await teamService.createTeam(payload);
      notificationService.success('Team created successfully');
      navigate(`/teams/${created.id}/dashboard`);
    } catch (e) {
      notificationService.error('Failed to create team');
    }
  };

  return (
    <div className="container py-24">
      <Card className="card">
        <h2 className="h2 mb-16">Create Team</h2>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Team Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a team name' }, { min: 3, message: 'Team name must be at least 3 characters' }]}
          >
            <Input placeholder="e.g. Platform Engineering" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} placeholder="Optional description" />
          </Form.Item>
          <div className="flex gap-12">
            <Button htmlType="submit" type="primary" className="btn-base btn-primary">Create Team</Button>
            <Button onClick={() => navigate(-1)} className="btn-base btn-secondary">Cancel</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default TeamForm;
