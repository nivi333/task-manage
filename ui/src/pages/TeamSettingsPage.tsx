import React from 'react';
import { Row, Col } from 'antd';
import MemberSelector from '../components/team/MemberSelector';
import TeamSettings from '../components/team/TeamSettings';
import { useParams } from 'react-router-dom';
import { UUID } from '../types/task';

const TeamSettingsPage: React.FC = () => {
  const { id } = useParams();
  const teamId = id as UUID;

  return (
    <div className="container py-24">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <MemberSelector teamId={teamId} />
        </Col>
        <Col xs={24} lg={10}>
          <TeamSettings />
        </Col>
      </Row>
    </div>
  );
};

export default TeamSettingsPage;
