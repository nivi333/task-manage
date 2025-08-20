import React from 'react';
import { Avatar, Typography, Space, Tooltip } from 'antd';
import { Team } from '../../types/team';

interface Props {
  team: Team;
}

const TeamHeader: React.FC<Props> = ({ team }) => {
  return (
    <div className="card p-md flex-row gap-md align-center justify-between">
      <div className="flex-row gap-md align-center">
        <Avatar size={48} className="bg-primary">{team.name?.[0]?.toUpperCase() || 'T'}</Avatar>
        <div>
          <Typography.Title level={4} className="mb-0">{team.name}</Typography.Title>
          <Typography.Text type="secondary">{team.memberCount} members</Typography.Text>
        </div>
      </div>
      {team.description && (
        <Tooltip title={team.description}>
          <Typography.Text ellipsis className="max-w-320">{team.description}</Typography.Text>
        </Tooltip>
      )}
    </div>
  );
};

export default TeamHeader;
