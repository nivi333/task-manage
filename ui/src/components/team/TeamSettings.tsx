import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService } from '../../services/teamService';
import { Team } from '../../types/team';
import { UUID } from '../../types/task';
import { notificationService } from '../../services/notificationService';

const TeamSettings: React.FC = () => {
  const { id } = useParams();
  const teamId = (id as UUID);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const team = await teamService.getTeam(teamId);
      form.setFieldsValue({ name: team.name, description: team.description });
    } catch (e) {
      notificationService.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const onSave = async (values: { name: string; description?: string }) => {
    setSaving(true);
    try {
      const payload: Partial<Team> = { name: values.name, description: values.description } as any;
      await teamService.updateTeam(teamId, payload);
      notificationService.success('Team updated');
    } catch (e) {
      notificationService.error('Failed to update team');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    Modal.confirm({
      title: 'Delete team?',
      content: 'This action cannot be undone. All associations will be removed.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await teamService.deleteTeam(teamId);
          notificationService.success('Team deleted');
          navigate('/dashboard');
        } catch (e) {
          notificationService.error('Failed to delete team');
        }
      },
    });
  };

  return (
    <Card title="Team Settings" className="card" loading={loading}>
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item
          label="Team Name"
          name="name"
          rules={[{ required: true, message: 'Team name is required' }, { min: 3, message: 'Minimum 3 characters' }]}
        >
          <Input placeholder="Team name" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Optional description" />
        </Form.Item>
        <div className="flex gap-12">
          <Button htmlType="submit" type="primary" className="btn-base btn-primary" loading={saving}>Save Changes</Button>
          <Button onClick={onDelete} danger className="btn-base">Delete Team</Button>
        </div>
      </Form>
    </Card>
  );
};

export default TeamSettings;
