import React from 'react';
import { Row, Col, Card } from 'antd';
import AppLayout from '../components/layout/AppLayout';
import MemberSelector from '../components/team/MemberSelector';
import TeamSettings from '../components/team/TeamSettings';
import { useParams } from 'react-router-dom';
import { UUID } from '../types/task';

const TeamSettingsPage: React.FC = () => {
  const { id } = useParams();
  const teamId = id as UUID;

  return (
    <AppLayout title="Team Settings">
      <Row gutter={[32, 32]} style={{ marginTop: 16, marginBottom: 16 }} justify="center">
        <Col xs={24} md={14} style={{ minWidth: 350 }}>
          <Card
            title={<span style={{ fontWeight: 600, fontSize: 18 }}>Team Members</span>}
            style={{ minHeight: 360, borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2' }}
            bodyStyle={{ padding: 24 }}
            extra={<span style={{ color: '#888', fontSize: 13 }}>Add or remove members for this team</span>}
          >
            <MemberSelector teamId={teamId} cardless />
          </Card>
        </Col>
        <Col xs={24} md={10} style={{ minWidth: 320 }}>
          <Card
            title={<span style={{ fontWeight: 600, fontSize: 18 }}>Team Settings</span>}
            style={{ minHeight: 360, borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2' }}
            bodyStyle={{ padding: 24 }}
            extra={<span style={{ color: '#888', fontSize: 13 }}>Edit team name or description</span>}
          >
            <TeamSettings cardless />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
};

export default TeamSettingsPage;
