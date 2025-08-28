import React from "react";
import { Avatar, Breadcrumb, Card, Space, Tag, Typography } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Project } from "../../types/project";
import { useNavigate } from "react-router-dom";
import { HeaderTitle, TTButton } from "../common";

const { Title, Text, Paragraph } = Typography;

interface Props {
  project: Project;
}

const ProjectHeader: React.FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  return (
    <Card className="tt-project-header" bodyStyle={{ padding: 12 }}>
      <div className="tt-project-header-inner">
        {/* Top-left back button inside content area */}
        <TTButton
          className="tt-back-btn"
          type="text"
          aria-label="Back"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />

        {/* Tiny breadcrumb for compact spacing */}
        <div className="tt-breadcrumb-row">
          <Breadcrumb
            items={[
              { title: <a onClick={() => navigate("/dashboard")}>Dashboard</a> },
              { title: "Projects" },
              { title: project.name },
            ]}
          />
        </div>

        <div className="tt-header-main">
          <Space align="start" size={12}>
            <Avatar
              size={48}
              icon={<UserOutlined />}
              src={project.owner?.avatarUrl}
            />
            <div>
              <HeaderTitle level={4}>
                {project.name}
              </HeaderTitle>
              <Space size={6} wrap>
                {project.key ? <Tag className="tt-tag" color="blue">{project.key}</Tag> : null}
                {project.status ? (
                  <Tag
                    className="tt-tag"
                    color={
                      project.status === "ACTIVE"
                        ? "green"
                        : project.status === "COMPLETED"
                        ? "blue"
                        : "orange"
                    }
                  >
                    {project.status}
                  </Tag>
                ) : null}
                {project.startDate ? (
                  <Tag className="tt-tag" icon={<CalendarOutlined />}>
                    {new Date(project.startDate).toLocaleDateString()} –
                  </Tag>
                ) : null}
                {project.endDate ? (
                  <Tag className="tt-tag" icon={<CalendarOutlined />}>
                    {new Date(project.endDate).toLocaleDateString()}
                  </Tag>
                ) : null}
              </Space>
            </div>
          </Space>
          <Space>
            <TTButton size="small" type="primary" icon={<EditOutlined />}>Edit</TTButton>
          </Space>
        </div>

        {project.description ? (
          <Paragraph className="tt-project-desc" type="secondary">
            {project.description}
          </Paragraph>
        ) : null}
      </div>
    </Card>
  );
};

export default ProjectHeader;
