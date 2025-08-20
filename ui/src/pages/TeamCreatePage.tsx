import React from 'react';
import { Card } from 'antd';
import TeamForm from '../components/team/TeamForm';

const TeamCreatePage: React.FC = () => {
  return (
    <div className="container py-24">
      <Card className="card">
        <TeamForm />
      </Card>
    </div>
  );
};

export default TeamCreatePage;
