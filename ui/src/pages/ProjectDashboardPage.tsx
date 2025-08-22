import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Col, Result, Row, Skeleton, Space } from "antd";
import AppLayout from "../components/layout/AppLayout";
import { HeaderTitle } from "../components/common";
import ProjectHeader from "../components/project/ProjectHeader";
import ProjectStats from "../components/project/ProjectStats";
// import TaskSummary from '../components/project/TaskSummary';
import TeamMembers from "../components/project/TeamMembers";
import ProgressCharts from "../components/project/ProgressCharts";
import ActivityFeed from "../components/project/ActivityFeed";
import Timeline from "../components/project/Timeline";
import { projectService } from "../services/projectService";
import {
  ActivityItem,
  BurndownPoint,
  Project,
  ProjectDashboardData,
  ProjectMetrics,
  TaskSummaryItem,
  TeamMember,
} from "../types/project";
import { notificationService } from "../services/notificationService";

function isValidId(id?: string) {
  if (!id) return false;
  // Accept UUID-like or any non-empty id for now (backend may use UUID). Keep simple validation.
  const uuidRegex = /^[0-9a-fA-F-]{8,}$/;
  return uuidRegex.test(id);
}

const ProjectDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [taskSummary, setTaskSummary] = useState<TaskSummaryItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [timeline, setTimeline] = useState<{ date: string; label: string }[]>(
    []
  );
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [burndown, setBurndown] = useState<BurndownPoint[]>([]);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    if (!isValidId(id)) {
      notificationService.error("Invalid project id");
      setErrorStatus(400);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setErrorStatus(null);
      try {
        const [dashboard, burn] = await Promise.all([
          projectService.getDashboard(id!),
          projectService.getBurndown(id!),
        ]);

        // Defensive validation of analytics data
        const safeBurndown = Array.isArray(burn)
          ? burn.filter((p) => p && p.date && typeof p.remaining === "number")
          : [];
        if (safeBurndown.length !== (burn as any[])?.length) {
          notificationService.info(
            "Some analytics points were ignored due to invalid data"
          );
        }

        setProject(dashboard.project);
        setMetrics(dashboard.metrics);
        setTaskSummary(
          Array.isArray(dashboard.taskSummary) ? dashboard.taskSummary : []
        );
        setTeam(Array.isArray(dashboard.team) ? dashboard.team : []);
        setTimeline(
          Array.isArray(dashboard.timeline) ? dashboard.timeline! : []
        );
        setActivity(
          Array.isArray(dashboard.recentActivity)
            ? dashboard.recentActivity
            : []
        );
        setBurndown(safeBurndown);
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
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </Space>
      );
    }

    if (errorStatus) {
      if (errorStatus === 403) {
        return (
          <Result
            status="403"
            title="Unauthorized"
            subTitle="You do not have access to this project."
          />
        );
      }
      if (errorStatus === 404) {
        return (
          <Result
            status="404"
            title="Project Not Found"
            subTitle="The requested project does not exist."
          />
        );
      }
      if (errorStatus === 400) {
        return (
          <Result
            status="error"
            title="Invalid Project Id"
            subTitle="Please check the URL and try again."
          />
        );
      }
      return (
        <Result
          status="error"
          title="Error"
          subTitle="Failed to load project dashboard."
        />
      );
    }

    if (!project || !metrics) {
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
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <ProjectHeader project={project} />
        <ProjectStats metrics={metrics} />
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            {/* <TaskSummary items={taskSummary} /> */}
          </Col>
          <Col xs={24} lg={12}>
            <TeamMembers members={team} />
          </Col>
        </Row>
        <ProgressCharts burndown={burndown} metrics={metrics} />
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Timeline items={timeline} />
          </Col>
          <Col xs={24} lg={12}>
            <ActivityFeed items={activity} />
          </Col>
        </Row>
      </Space>
    );
  }, [
    loading,
    errorStatus,
    project,
    metrics,
    taskSummary,
    team,
    timeline,
    burndown,
    activity,
  ]);

  return (
    <AppLayout
      title={
        <HeaderTitle level={3}>
          {project?.name || "Project Dashboard"}
        </HeaderTitle>
      }
    >
      {content}
    </AppLayout>
  );
};

export default ProjectDashboardPage;
