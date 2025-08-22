import React, { useEffect, useState } from 'react';
import { Button, Card, Form, List, Avatar, Tag, Select, Spin } from 'antd';
import { teamService } from '../../services/teamService';
import { TeamMemberBrief } from '../../types/team';
import { UUID } from '../../types/task';
import { notificationService } from '../../services/notificationService';

interface MemberSelectorProps {
  teamId: UUID;
  cardless?: boolean;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({ teamId, cardless = false }) => {
  const [members, setMembers] = useState<TeamMemberBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();
  const [userOptions, setUserOptions] = useState<{label: string, value: string, email: string, firstName?: string, lastName?: string, profilePicture?: string}[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const loadAllUsers = async () => {
    setUserSearchLoading(true);
    try {
      const users = await (await import('../../services/userService')).userService.getUsersForTeams();
      // Deduplicate users by email (primary key for uniqueness)
      const uniqueUsers = users.reduce((acc, user) => {
        const existingUser = acc.find(u => u.email === user.email);
        if (!existingUser) {
          acc.push(user);
        }
        return acc;
      }, [] as typeof users);
      
      setUserOptions(
        uniqueUsers.map(u => ({
          label: u.username,
          value: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          profilePicture: u.profilePicture
        }))
      );
    } catch {
      setUserOptions([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

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
    loadAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const onAdd = async (values: { userId: string }) => {
    setAdding(true);
    try {
      await teamService.addMember(teamId, { id: values.userId });
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

  const content = (
    <>
      <Form form={form} layout="inline" onFinish={onAdd} className="mb-16">
        <Form.Item
          name="userId"
          rules={[{ required: true, message: 'Select a user' }]}
          className="flex-1"
        >
          <Select
            showSearch
            placeholder="Select user to add"
            filterOption={(input, option) => {
              const label = option?.label?.toString().toLowerCase() || '';
              const email = option?.email?.toString().toLowerCase() || '';
              const searchTerm = input.toLowerCase();
              return label.includes(searchTerm) || email.includes(searchTerm);
            }}
            loading={userSearchLoading}
            style={{ minWidth: 320, flex: 2, height: 48 }}
            className="member-selector-select"
            labelInValue={false}
            getPopupContainer={trigger => trigger.parentNode}
          >
            {userOptions
              .filter(user => !members.some(m => m.id === user.value))
              .map(user => (
              <Select.Option key={user.value} value={user.value} label={user.label} email={user.email}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar 
                    size={32} 
                    src={user.profilePicture} 
                    style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                  >
                    {user.label?.[0]?.toUpperCase()}
                  </Avatar>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#262626', lineHeight: '20px' }}>
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.label}
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '12px', lineHeight: '16px' }}>{user.email}</div>
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item style={{ marginLeft: 12 }}>
          <Button htmlType="submit" type="primary" className="btn-base btn-primary" loading={adding}>
            Add Member
          </Button>
        </Form.Item>
      </Form>

      <List
        loading={loading}
        dataSource={members}
        locale={{ 
          emptyText: (
            <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '48px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No team members yet</div>
              <div style={{ fontSize: 14 }}>Add members using the dropdown above</div>
            </div>
          )
        }}
        renderItem={(m) => (
          <List.Item
            style={{ 
              padding: '8px 0', 
              borderBottom: '1px solid #f0f0f0',
              transition: 'background-color 0.2s'
            }}
            actions={[
              <Button 
                key="remove" 
                onClick={() => onRemove(m.id)} 
                danger 
                size="small"
                style={{ 
                  borderColor: '#ff4d4f',
                  color: '#ff4d4f',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff4d4f';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ff4d4f';
                }}
              >
                Remove
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  size={40} 
                  src={m.avatarUrl} 
                  style={{ 
                    backgroundColor: m.role === 'OWNER' ? '#f5222d' : m.role === 'MANAGER' ? '#1890ff' : '#52c41a',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  {m.username?.[0]?.toUpperCase()}
                </Avatar>
              }
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
                    {m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.username}
                  </span>
                  <Tag 
                    color={m.role === 'OWNER' ? 'red' : m.role === 'MANAGER' ? 'blue' : 'green'}
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: 500,
                      borderRadius: '4px',
                      padding: '2px 8px'
                    }}
                  >
                    {m.role}
                  </Tag>
                </div>
              }
              description={
                <div style={{ color: '#8c8c8c', fontSize: '14px', marginTop: '4px' }}>
                  {m.email}
                  {m.username !== (m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.username) && (
                    <span style={{ marginLeft: 8, color: '#bfbfbf' }}>@{m.username}</span>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </>
  );

  return cardless ? content : (
    <Card title="Team Members" className="card">
      {content}
    </Card>
  );
};

export default MemberSelector;
