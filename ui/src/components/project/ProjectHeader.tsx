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
    <Card>
      <Space direction="vertical" style={{ width: "100%" }} size={8}>
        <Breadcrumb
          items={[
            { title: <a onClick={() => navigate("/dashboard")}>Dashboard</a> },
            { title: "Projects" },
            { title: project.name },
          ]}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Space align="start">
            <Avatar
              size={56}
              icon={<UserOutlined />}
              src={project.owner?.avatarUrl}
            />
            <div>
              <HeaderTitle level={3}>{project.name}</HeaderTitle>
              <Space size={8} wrap>
                {project.key ? <Tag color="blue">{project.key}</Tag> : null}
                {project.status ? (
                  <Tag
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
                  <Tag icon={<CalendarOutlined />}>
                    Start: {new Date(project.startDate).toLocaleDateString()}
                  </Tag>
                ) : null}
                {project.endDate ? (
                  <Tag icon={<CalendarOutlined />}>
                    End: {new Date(project.endDate).toLocaleDateString()}
                  </Tag>
                ) : null}
              </Space>
            </div>
          </Space>
          <Space>
            <TTButton
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
            <TTButton type="primary" icon={<EditOutlined />}>
              Edit Project
            </TTButton>
          </Space>
        </div>
        {project.description ? (
          <Paragraph type="secondary" style={{ marginTop: 4 }}>
            {project.description}
          </Paragraph>
        ) : null}
      </Space>
    </Card>
  );
};

export default ProjectHeader;
