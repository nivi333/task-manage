import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Row, Space, Table, Typography } from 'antd';
import AppLayout from '../components/layout/AppLayout';
import { HeaderTitle, TTDateRangePicker } from '../components/common';
import MetricCards from '../components/analytics/MetricCards';
import ChartContainer from '../components/analytics/ChartContainer';
import ExportButton from '../components/analytics/ExportButton';
import analyticsService from '../services/analyticsService';
import { AnalyticsFilters, AnalyticsResponse, AnalyticsSummary, TeamProductivityItem, TimelinePoint } from '../types/analytics';

const fmtISO = (d: Date) => d.toISOString();

const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);
  return { from: fmtISO(from), to: fmtISO(to) };
};

const AnalyticsDashboardPage: React.FC = () => {
  const [range, setRange] = useState(defaultRange());
  const [summary, setSummary] = useState<AnalyticsSummary | undefined>();
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [team, setTeam] = useState<TeamProductivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const filters: AnalyticsFilters = useMemo(() => ({ range }), [range]);

  const load = useCallback(async () => {
    // basic validation
    if (!range.from || !range.to || new Date(range.from) > new Date(range.to)) {
      setSummary(undefined);
      setTimeline([]);
      setTeam([]);
      return;
    }
    setLoading(true);
    try {
      const [s, t, tp] = await Promise.all([
        analyticsService.getSummary(filters),
        analyticsService.getTimeline(filters),
        analyticsService.getTeamProductivity(filters),
      ]);
      setSummary(s);
      setTimeline(t);
      setTeam(tp);
    } catch (e) {
      // On error, ensure safe UI state
      setSummary(undefined);
      setTimeline([]);
      setTeam([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const onRangeChange = (dates: any, dateStrings: [string, string]) => {
    const [start, end] = dateStrings;
    setRange({ from: new Date(start).toISOString(), to: new Date(end).toISOString() });
  };

  const timelineColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Tasks Completed', dataIndex: 'tasksCompleted', key: 'tasksCompleted' },
    { title: 'Tasks Created', dataIndex: 'tasksCreated', key: 'tasksCreated' },
  ];

  const teamColumns = [
    { title: 'Team', dataIndex: 'teamName', key: 'teamName' },
    { title: 'Tasks Completed', dataIndex: 'tasksCompleted', key: 'tasksCompleted' },
    { title: 'Avg Cycle Time (days)', dataIndex: 'avgCycleTimeDays', key: 'avgCycleTimeDays' },
  ];

  return (
    <AppLayout title={<HeaderTitle level={3}>Analytics Dashboard</HeaderTitle>} contentPadding={0}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {/* Filters row: label + picker inline, no card wrapper/border */}
        <Row align="middle" justify="space-between" style={{ marginBottom: 4 }}>
          <Col>
            <Typography.Text type="secondary">Select a date range to analyze performance.</Typography.Text>
          </Col>
          <Col>
            <TTDateRangePicker onChange={onRangeChange} />
          </Col>
        </Row>

        <MetricCards summary={summary} loading={loading} />

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <ChartContainer
              title={<Space>Task Completion Timeline</Space>}
              extra={<ExportButton filename="timeline" data={timeline} />}
            >
              <Table
                size="small"
                rowKey={(r: TimelinePoint) => r.date}
                columns={timelineColumns as any}
                dataSource={timeline}
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </ChartContainer>
          </Col>
          <Col xs={24} md={12}>
            <ChartContainer
              title={<Space>Team Productivity</Space>}
              extra={<ExportButton filename="team-productivity" data={team} />}
            >
              <Table
                size="small"
                rowKey={(r: TeamProductivityItem) => r.teamId}
                columns={teamColumns as any}
                dataSource={team}
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </ChartContainer>
          </Col>
        </Row>
      </Space>
    </AppLayout>
  );
};

export default AnalyticsDashboardPage;
