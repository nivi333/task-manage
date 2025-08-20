import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Card,
  Empty,
  List,
  Space,
  Spin,
  Tag,
  Typography,
  Popconfirm
} from "antd";
import { UserAddOutlined, UserDeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import AppLayout from "../components/layout/AppLayout";
import { projectService } from "../services/projectService";
import { TeamMember } from "../types/project";
import { UUID } from "../types/task";
import { notificationService } from "../services/notificationService";
import InviteMemberModal from "../components/project/InviteMemberModal";
import RoleSelector from "../components/project/RoleSelector";
import PermissionMatrix from "../components/project/PermissionMatrix";
import { HeaderTitle, TTButton } from "../components/common";

const { Paragraph, Text } = Typography;

const roleColors: Record<string, string> = {
  OWNER: "magenta",
  MANAGER: "geekblue",
  MEMBER: "green",
};

const ProjectTeamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const loadMembers = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await projectService.listMembers(id as UUID);
      setMembers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 403) {
        notificationService.error("You are not authorized to view this team");
      } else {
        notificationService.error(
          e?.message || "Failed to load project members"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onInvite = async (email: string, role: "MANAGER" | "MEMBER") => {
    if (!id) return;
    try {
      await projectService.inviteMember(id as UUID, { email, role });
      notificationService.success("Member invited successfully");
      setInviteOpen(false);
      await loadMembers();
    } catch (e: any) {
      if (e?.response?.status === 409) {
        notificationService.error("User is already a member of this project");
      } else if (e?.response?.status === 404) {
        notificationService.error("User not found");
      } else if (e?.response?.status === 403) {
        notificationService.error("You are not allowed to invite members");
      } else {
        notificationService.error(e?.message || "Failed to invite member");
      }
    }
  };

  const onChangeRole = async (
    userId: UUID,
    role: "OWNER" | "MANAGER" | "MEMBER"
  ) => {
    if (!id) return;
    try {
      await projectService.updateMemberRole(id as UUID, userId, { role });
      notificationService.success("Member role updated");
      await loadMembers();
    } catch (e: any) {
      if (e?.response?.status === 403) {
        notificationService.error("You are not allowed to change roles");
      } else {
        notificationService.error(e?.message || "Failed to update member role");
      }
    }
  };

  const onRemove = async (userId: UUID) => {
    if (!id) return;
    try {
      await projectService.removeMember(id as UUID, userId);
      notificationService.success("Member removed");
      await loadMembers();
    } catch (e: any) {
      if (e?.response?.status === 403) {
        notificationService.error("You are not allowed to remove members");
      } else {
        notificationService.error(e?.message || "Failed to remove member");
      }
    }
  };

  const content = useMemo(() => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin />
        </div>
      );
    }

    if (!members.length) {
      return (
        <Card>
          <Empty description="No team members yet">
            <TTButton
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setInviteOpen(true)}
            >
              Invite Member
            </TTButton>
          </Empty>
        </Card>
      );
    }

    return (
      <Card>
        <List
          itemLayout="horizontal"
          dataSource={members}
          renderItem={(m) => (
            <List.Item
              actions={[
                <RoleSelector
                  key="role"
                  value={m.role as any}
                  onChange={(r: "OWNER" | "MANAGER" | "MEMBER") =>
                    onChangeRole(m.id, r)
                  }
                />,
                <Popconfirm
                  key="remove"
                  title="Remove member"
                  description={`Are you sure you want to remove ${m.name} from this project?`}
                  okText="Remove"
                  okType="danger"
                  onConfirm={() => onRemove(m.id)}
                >
                  <TTButton icon={<UserDeleteOutlined />} danger type="text">
                    Remove
                  </TTButton>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={m.avatarUrl}>{m.name?.[0]}</Avatar>}
                title={
                  <Space>
                    <Text>{m.name}</Text>
                    <Tag color={roleColors[m.role] || "default"}>{m.role}</Tag>
                  </Space>
                }
                description={m.email}
              />
            </List.Item>
          )}
        />
      </Card>
    );
  }, [loading, members]);

  return (
    <AppLayout
      title={<HeaderTitle level={3}>Project Team</HeaderTitle>}
      contentPadding={16}
    >
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        <Card
          title={<HeaderTitle level={4}>Team Members</HeaderTitle>}
          extra={
            <Space>
              <TTButton
                ttVariant="transparent"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              >
                Back
              </TTButton>
              <TTButton
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setInviteOpen(true)}
              >
                Invite
              </TTButton>
            </Space>
          }
        >
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Manage roles and members of this project.
          </Paragraph>
          {content}
        </Card>
        <PermissionMatrix />
      </Space>

      <InviteMemberModal
        open={inviteOpen}
        onCancel={() => setInviteOpen(false)}
        onSubmit={onInvite}
      />
    </AppLayout>
  );
};

export default ProjectTeamPage;
