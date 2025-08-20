import React from 'react';
import { Avatar, Card, List, Tag, Typography } from 'antd';
import { TeamMemberBrief } from '../../types/team';

interface Props {
  members: TeamMemberBrief[];
}

const roleColor: Record<TeamMemberBrief['role'], string> = {
  OWNER: 'purple',
  MANAGER: 'geekblue',
  MEMBER: 'green',
};

const MemberGrid: React.FC<Props> = ({ members }) => {
  return (
    <Card className="card">
      <Typography.Title level={5} className="mb-sm">Team Members</Typography.Title>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
        dataSource={members}
        renderItem={(m) => (
          <List.Item>
            <Card className="p-sm">
              <div className="flex-row gap-sm align-center">
                <Avatar src={m.avatarUrl} size={40} className="bg-primary">
                  {(!m.avatarUrl && m.username?.[0]?.toUpperCase()) || 'U'}
                </Avatar>
                <div className="flex-1">
                  <div className="flex-row justify-between align-center">
                    <Typography.Text strong>{m.username}</Typography.Text>
                    <Tag color={roleColor[m.role]}>{m.role}</Tag>
                  </div>
                  <Typography.Text type="secondary">{m.email}</Typography.Text>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default MemberGrid;
