import React from 'react';
import { Calendar, Card, Typography } from 'antd';

const TeamCalendar: React.FC = () => {
  return (
    <Card className="card">
      <Typography.Title level={5} className="mb-sm">Team Calendar</Typography.Title>
      <Calendar fullscreen={false} />
    </Card>
  );
};

export default TeamCalendar;
