import React from 'react';
import { Drawer, Avatar, Typography, Row, Col, Divider, Empty } from 'antd';
import { UsergroupAddOutlined } from '@ant-design/icons';
import MemberSelector from './MemberSelector';
import TeamSettings from './TeamSettings';
import { Team } from '../../types/team';

interface TeamSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  team: Team | null;
  linkedProjects?: string[];
  linkedTasks?: string[];
}

const TeamSettingsDrawer: React.FC<TeamSettingsDrawerProps> = ({ open, onClose, team, linkedProjects = [], linkedTasks = [] }) => {
  if (!team) return null;
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="45%"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={40} icon={<UsergroupAddOutlined />} style={{ background: '#3f51b5' }} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>{team.name}</Typography.Title>
            <Typography.Text type="secondary">{team.description || 'No description'}</Typography.Text>
          </div>
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <MemberSelector teamId={team.id} cardless />
        </div>
        <div>
          <TeamSettings team={team} cardless />
        </div>
      </div>
      <Divider style={{ margin: '16px 0 8px 0' }} />
      <div style={{ padding: '0 32px 24px 32px' }}>
        <Typography.Title level={5} style={{ marginBottom: 8 }}>Linked Projects</Typography.Title>
        {linkedProjects.length > 0 ? (
          linkedProjects.map((proj, idx) => (
            <Typography.Text key={idx} style={{ display: 'block' }}>{proj}</Typography.Text>
          ))
        ) : (
          <Empty description="This team is not assigned to any project." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
        <Divider style={{ margin: '16px 0 8px 0' }} />
        <Typography.Title level={5} style={{ marginBottom: 8 }}>Linked Tasks</Typography.Title>
        {linkedTasks.length > 0 ? (
          linkedTasks.map((task, idx) => (
            <Typography.Text key={idx} style={{ display: 'block' }}>{task}</Typography.Text>
          ))
        ) : (
          <Empty description="This team is not assigned to any task." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </Drawer>
  );
};

export default TeamSettingsDrawer;
