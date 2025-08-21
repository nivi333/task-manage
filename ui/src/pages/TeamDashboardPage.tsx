import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Spin, Alert, Space } from 'antd';
import TeamHeader from 'components/team/TeamHeader';
import MemberGrid from 'components/team/MemberGrid';
import TeamStats from 'components/team/TeamStats';
import RecentActivity from 'components/team/RecentActivity';
import TeamCalendar from 'components/team/TeamCalendar';
import { teamService } from 'services/teamService';
import { Team, TeamMemberBrief, TeamStatsSummary, TeamActivityItem } from 'types/team';
import { UUID } from 'types/task';

const TeamDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: UUID }>();
  const teamId = id as UUID;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberBrief[]>([]);
  const [stats, setStats] = useState<TeamStatsSummary | null>(null);
  const [activity, setActivity] = useState<TeamActivityItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [teamData, memberData, statsData, activityData] = await Promise.all([
          teamService.getTeam(teamId),
          teamService.getMembers(teamId),
          teamService.getStats(teamId),
          teamService.getRecentActivity(teamId),
        ]);
        setTeam(teamData);
        setMembers(memberData);
        setStats(statsData);
        setActivity(activityData);
      } catch (e: any) {
        setError(e?.message || 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    };
    if (teamId) fetchData();
  }, [teamId]);

  if (!teamId) {
    return <Alert message="Invalid team id." type="error" showIcon style={{ margin: 32 }} />;
  }

  if (loading) {
    return <Spin size="large" style={{ margin: 64, display: 'block' }} />;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon style={{ margin: 32 }} />;
  }

  if (!team) {
    return <Alert message="Team not found." type="error" showIcon style={{ margin: 32 }} />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <TeamHeader team={team} />
      {stats && <TeamStats stats={stats} />}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}><MemberGrid members={members} /></Col>
        <Col xs={24} md={8}><RecentActivity items={activity} /></Col>
      </Row>
      <TeamCalendar />
    </Space>
  );
};

export default TeamDashboardPage;
