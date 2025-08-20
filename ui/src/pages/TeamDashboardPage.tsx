import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Col, Result, Row, Skeleton, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AppLayout from '../components/layout/AppLayout';
import { HeaderTitle } from '../components/common';
import TeamHeader from '../components/team/TeamHeader';
import MemberGrid from '../components/team/MemberGrid';
import TeamStats from '../components/team/TeamStats';
import RecentActivity from '../components/team/RecentActivity';
import TeamCalendar from '../components/team/TeamCalendar';
import { teamService } from '../services/teamService';
import { Team, TeamMemberBrief, TeamStatsSummary, TeamActivityItem } from '../types/team';
import { notificationService } from '../services/notificationService';

function isValidId(id?: string) {
  if (!id) return false;
  const uuidRegex = /^[0-9a-fA-F-]{8,}$/;
  return uuidRegex.test(id);
}

const TeamDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberBrief[]>([]);
  const [stats, setStats] = useState<TeamStatsSummary | null>(null);
  const [activity, setActivity] = useState<TeamActivityItem[]>([]);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    if (!isValidId(id)) {
      notificationService.error('Invalid team id');
      setErrorStatus(400);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setErrorStatus(null);
      try {
        const [t, m, s, a] = await Promise.all([
          teamService.getTeam(id!),
          teamService.getMembers(id!),
          teamService.getStats(id!),
          teamService.getRecentActivity(id!),
        ]);
        setTeam(t);
        setMembers(Array.isArray(m) ? m : []);
        setStats(s);
        setActivity(Array.isArray(a) ? a : []);
      } catch (e: any) {
        const status = e?.response?.status;
        setErrorStatus(status || 500);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </Space>
      );
    }

    if (errorStatus) {
      if (errorStatus === 403) {
        return <Result status="403" title="Unauthorized" subTitle="You do not have access to this team." />;
      }
      if (errorStatus === 404) {
        return <Result status="404" title="Team Not Found" subTitle="The requested team does not exist." />;
      }
      if (errorStatus === 400) {
        return <Result status="error" title="Invalid Team Id" subTitle="Please check the URL and try again." />;
      }
      return <Result status="error" title="Error" subTitle="Failed to load team dashboard." />;
    }

    if (!team || !stats) {
      return (
        <Alert
          type="warning"
          message="Incomplete data"
          description="Dashboard data is missing. Please try again later."
          showIcon
        />
      );
    }

    return (
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TeamHeader team={team} />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/teams/create')}
          >
            Team Creation & Management
          </Button>
        </div>
        <TeamStats stats={stats} />
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <MemberGrid members={members} />
          </Col>
          <Col xs={24} lg={10}>
            <RecentActivity items={activity} />
          </Col>
        </Row>
        <TeamCalendar />
      </Space>
    );
  }, [loading, errorStatus, team, stats, members, activity]);

  return (
    <AppLayout title={<HeaderTitle level={3}>{team?.name || 'Team Dashboard'}</HeaderTitle>} contentPadding={16}>
      {content}
    </AppLayout>
  );
};

export default TeamDashboardPage;
