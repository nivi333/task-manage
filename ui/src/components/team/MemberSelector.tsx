import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, List, Avatar, Tag } from 'antd';
import { teamService } from '../../services/teamService';
import { TeamMemberBrief } from '../../types/team';
import { UUID } from '../../types/task';
import { notificationService } from '../../services/notificationService';

interface MemberSelectorProps {
  teamId: UUID;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({ teamId }) => {
  const [members, setMembers] = useState<TeamMemberBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await teamService.getMembers(teamId);
      setMembers(data);
    } catch (e) {
      notificationService.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const onAdd = async (values: { usernameOrEmail: string }) => {
    setAdding(true);
    try {
      const payload = /@/.test(values.usernameOrEmail)
        ? { email: values.usernameOrEmail }
        : { username: values.usernameOrEmail };
      await teamService.addMember(teamId, payload as any);
      notificationService.success('Member added');
      form.resetFields();
      loadMembers();
    } catch (e) {
      notificationService.error('Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const onRemove = async (userId: UUID) => {
    try {
      await teamService.removeMember(teamId, userId);
      notificationService.success('Member removed');
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (e) {
      notificationService.error('Failed to remove member');
    }
  };

  return (
    <Card title="Team Members" className="card">
      <Form form={form} layout="inline" onFinish={onAdd} className="mb-16">
        <Form.Item
          name="usernameOrEmail"
          rules={[{ required: true, message: 'Enter username or email' }]}
          className="flex-1"
        >
          <Input placeholder="Add member by username or email" allowClear />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" className="btn-base btn-primary" loading={adding}>
            Add Member
          </Button>
        </Form.Item>
      </Form>

      <List
        loading={loading}
        dataSource={members}
        renderItem={(m) => (
          <List.Item
            actions={[
              <Button key="remove" onClick={() => onRemove(m.id)} danger className="btn-base">
                Remove
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={m.avatarUrl}>{m.username?.[0]?.toUpperCase()}</Avatar>}
              title={
                <span>
                  {m.username} <Tag color="blue" className="ml-8">{m.role}</Tag>
                </span>
              }
              description={m.email}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default MemberSelector;
