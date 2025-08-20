import React from 'react';
import { Avatar, Card, List, Space, Tag, Tooltip } from 'antd';
import { TeamMember } from '../../types/project';
import { UserOutlined } from '@ant-design/icons';

interface Props {
  members: TeamMember[];
}

const TeamMembers: React.FC<Props> = ({ members }) => {
  return (
    <Card title={`Team Members (${members.length})`}>
      <List
        dataSource={members}
        renderItem={(m) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={m.avatarUrl} icon={<UserOutlined />} />}
              title={
                <Space>
                  <span>{m.name}</span>
                  <Tag color="blue">{m.role}</Tag>
                </Space>
              }
              description={m.email}
            />
          </List.Item>
        )}
      />
      {members.length === 0 && (
        <Tooltip title="Assign members to collaborate on this project">
          <div style={{ textAlign: 'center', color: '#999' }}>No members yet</div>
        </Tooltip>
      )}
    </Card>
  );
};

export default TeamMembers;
