import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Avatar,
  Tag,
  Typography,
  Space,
  Empty,
  Skeleton,
  Checkbox,
  Row,
  Col,
  Popconfirm,
  Progress,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UserOutlined,
  UnorderedListOutlined,
  AppstoreOutlined as GridIcon,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import "../styles/components/project-card.css";
import { Project, TeamMember } from "../types/project";
import { projectService } from "../services/projectService";
import { userService } from "../services/userService";
import { notificationService } from "../services/notificationService";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import EditProjectModal from "../components/projects/EditProjectModal";
import dayjs, { Dayjs } from "dayjs";
import {
  SearchBar,
  TTSelect,
  TTDateRangePicker,
  TTButton,
  HeaderTitle,
  TTTable,
} from "../components/common";
import { teamService } from "../services/teamService";
import { Team } from "../types/team";
import { createColorAllocator } from "../utils/colorAllocator";
import ProjectKeyBadge from "../components/common/ProjectKeyBadge";

const { Text } = Typography;

type ViewMode = "list" | "grid";

const ProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [teamId, setTeamId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [ownerCache, setOwnerCache] = useState<Record<string, TeamMember>>({});

  // Deterministic project color allocator for badges
  const projectColorAlloc = useMemo(() => createColorAllocator(), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await projectService.list();
        if (!mounted) return;
        setProjects(data || []);
      } catch (e: any) {
        notificationService.error(e?.message || "Failed to load projects");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // load teams for filter; ignore errors and keep empty if fail
    (async () => {
      try {
        const list = await teamService.list();
        setTeams(list || []);
      } catch {
        setTeams([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!projects) return [] as Project[];
    let list = projects;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.key?.toLowerCase().includes(q) ?? false) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.owner?.name?.toLowerCase().includes(q) ?? false)
      );
    }
    if (status) {
      list = list.filter(
        (p) => (p.status || "").toLowerCase() === status.toLowerCase()
      );
    }
    if (dateRange) {
      const [start, end] = dateRange;
      list = list.filter((p) => {
        const created = p.createdAt ? dayjs(p.createdAt) : null;
        if (!created) return true;
        return (
          created.isAfter(start.startOf("day")) &&
          created.isBefore(end.endOf("day"))
        );
      });
    }
    if (teamId) {
      list = list.filter((p) => (p as any).teamId === teamId);
    }
    return list;
  }, [projects, query, status, dateRange, teamId]);

  // Fetch owners by ownerId when members are not present
  useEffect(() => {
    const missing: string[] = [];
    for (const p of filtered) {
      if (!p) continue;
      if (!p.ownerId) continue;
      if (ownerCache[p.ownerId]) continue;
      const hasInMembers = Array.isArray(p.members)
        ? p.members.some((m) => m.id === p.ownerId)
        : false;
      if (!hasInMembers) missing.push(p.ownerId);
    }
    if (missing.length === 0) return;
    (async () => {
      const updates: Record<string, TeamMember> = {};
      for (const id of Array.from(new Set(missing))) {
        try {
          const u: any = await userService.getUserById(id);
          const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username;
          updates[id] = {
            id: u.id,
            name: fullName,
            email: u.email,
            role: (u.role as any) || "MEMBER",
            avatarUrl: u.avatarUrl || u.profilePicture,
          } as TeamMember;
        } catch (e) {
          // ignore fetch errors per-id
        }
      }
      if (Object.keys(updates).length > 0) {
        setOwnerCache((prev) => ({ ...prev, ...updates }));
      }
    })();
  }, [filtered, ownerCache]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await projectService.list();
      setProjects(data || []);
      setSelectedIds(new Set());
    } catch (e: any) {
      notificationService.error(e?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await projectService.bulkDelete(Array.from(selectedIds));
      notificationService.success("Deleted selected projects");
      await refresh();
    } catch (e: any) {
      notificationService.error(e?.message || "Failed to delete projects");
    }
  };

  const handleCreate = async (payload: any) => {
    try {
      await projectService.create(payload);
      notificationService.success("Project created");
      setCreating(false);
      await refresh();
    } catch (e: any) {
      notificationService.error(e?.message || "Failed to create project");
    }
  };

  const handleUpdate = async (id: string, payload: any) => {
    try {
      await projectService.update(id as any, payload);
      notificationService.success("Project updated");
      setEditingProject(null);
      await refresh();
    } catch (e: any) {
      notificationService.error(e?.message || "Failed to update project");
    }
  };

  const getOwner = (p: Project) => {
    if (p.owner?.name) return p.owner;
    if (p.ownerId && ownerCache[p.ownerId]) return ownerCache[p.ownerId];
    if (p.ownerId && Array.isArray(p.members)) {
      const byId = p.members.find((mm) => mm.id === p.ownerId);
      if (byId) return byId;
    }
    const byRole = (p.members || []).find((mm) => (mm.role || '').toUpperCase() === 'OWNER');
    return byRole || p.owner;
  };

  return (
    <AppLayout title={<HeaderTitle level={3}>Projects</HeaderTitle>}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div style={{ width: '100%', background: 'var(--color-card-background)', borderRadius: 8, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <HeaderTitle level={5} style={{ fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180, lineHeight: 1.2 }}>All Projects</HeaderTitle>
            <div className="tt-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search projects..."
                width={240}
              />
              <TTSelect
                allowClear
                placeholder="Status"
                width={160}
                value={status}
                onChange={(v) => setStatus(v as string | undefined)}
                options={[
                  { label: "Active", value: "ACTIVE" },
                  { label: "On Hold", value: "ON_HOLD" },
                  { label: "Completed", value: "COMPLETED" },
                ]}
              />
              <TTSelect
                allowClear
                placeholder="Team"
                width={200}
                value={teamId}
                onChange={(v) => setTeamId(v as string | undefined)}
                options={(teams || []).map((t) => ({ label: t.name, value: t.id }))}
              />
              <TTDateRangePicker onChange={(v) => setDateRange(v as any)} />
              <TTButton
                icon={<UnorderedListOutlined />}
                type={viewMode === "list" ? "primary" : "default"}
                onClick={() => setViewMode("list")}
              />
              <TTButton
                icon={<GridIcon />}
                type={viewMode === "grid" ? "primary" : "default"}
                onClick={() => setViewMode("grid")}
              />
              <TTButton
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreating(true)}
              >
                New Project
              </TTButton>
            </div>
          </div>
          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Text type="secondary">Selected: {selectedIds.size}</Text>
              <Popconfirm
                title="Delete selected projects?"
                onConfirm={handleBulkDelete}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <TTButton danger icon={<DeleteOutlined />}>
                  Delete Selected
                </TTButton>
              </Popconfirm>
            </div>
          )}
        </div>

        <div style={{ width: '100%', background: 'var(--color-card-background)', borderRadius: 8, padding: 0, marginBottom: 16 }}>
          {loading ? (
            <>
              <Skeleton active paragraph={{ rows: 2 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
            </>
          ) : filtered && filtered.length > 0 ? (
            viewMode === "list" ? (
              <ProjectsTable
                data={filtered}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onEdit={(p) => setEditingProject(p)}
                getProjectColor={(p) =>
                  projectColorAlloc.getColor(p.id || p.key || p.name)
                }
                resolveOwner={getOwner}
              />
            ) : (
              <Row gutter={[16, 16]}>
                {filtered.map((project) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
                    <Card
                      className="project-grid-card"
                      title={
                        <Space>
                          <Checkbox
                            checked={selectedIds.has(project.id)}
                            onChange={(e) =>
                              toggleSelect(project.id, e.target.checked)
                            }
                          />
{project.name}
                        </Space>
                      }
                      extra={
                        project.key ? (
                          <ProjectKeyBadge
                            keyText={project.key}
                            name={project.name}
                            color={projectColorAlloc.getColor(project.id || project.key)}
                          />
                        ) : undefined
                      }
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Space>
                          <Avatar
                            icon={<UserOutlined />}
                            src={getOwner(project)?.avatarUrl}
                          />
                          <Text>{getOwner(project)?.name || "Unknown Owner"}</Text>
                        </Space>
                        {typeof (project as any)?.metrics?.completionPercent === "number" ? (
                          <Progress percent={(project as any).metrics.completionPercent} size="small" status="active" />
                        ) : null}
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
                        <Text type="secondary">
                          {project.description || "No description"}
                        </Text>
                                                <TTButton icon={<EditOutlined />} onClick={() => setEditingProject(project)}>
                          Edit
                        </TTButton>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            )
          ) : (
            <Empty description="No projects found" />
          )}
        </div>

        <CreateProjectModal
          open={creating}
          onCancel={() => setCreating(false)}
          onCreate={handleCreate}
          existingNames={(projects || []).map((p) => p.name)}
        />
        <EditProjectModal
          open={!!editingProject}
          project={editingProject}
          onCancel={() => setEditingProject(null)}
          onUpdate={handleUpdate}
          existingNames={(projects || []).map((p) => p.name)}
        />
      </Space>
    </AppLayout>
  );
};

export default ProjectsListPage;

// Inline table component to provide headers and alignment in list view
const ProjectsTable: React.FC<{
  data: Project[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
  onEdit: (p: Project) => void;
  getProjectColor: (p: Project) => string;
  resolveOwner: (p: Project) => TeamMember | undefined;
}> = ({ data, selectedIds, onToggleSelect, onEdit, getProjectColor, resolveOwner }) => {

  const columns: ColumnsType<Project> = [
    {
      title: "",
      dataIndex: "select",
      width: 48,
      align: "center",
      render: (_: any, record) => (
        <Checkbox
          checked={selectedIds.has(record.id)}
          onChange={(e) => onToggleSelect(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Project",
      dataIndex: "name",
      key: "name",
      render: (_: any, record) => (
        <Space size={8} wrap>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            src={resolveOwner(record)?.avatarUrl}
          />
          {record.name}
          {record.key ? (
            <ProjectKeyBadge
              keyText={record.key}
              name={record.name}
              color={getProjectColor(record)}
            />
          ) : null}
        </Space>
      ),
    },
    {
      title: "Progress",
      dataIndex: "metrics",
      key: "progress",
      width: 160,
      render: (_: any, record) =>
        typeof (record as any)?.metrics?.completionPercent === "number" ? (
          <Progress percent={(record as any).metrics.completionPercent} size="small" />
        ) : (
          <span>-</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center" as const,
      render: (status?: string) =>
        status ? (
          <Tag
            color={
              status === "ACTIVE"
                ? "green"
                : status === "COMPLETED"
                ? "blue"
                : "orange"
            }
          >
            {status}
          </Tag>
        ) : null,
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
      width: 220,
      render: (_: any, record) => resolveOwner(record)?.name || "Unknown Owner",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      align: "center" as const,
      render: (d?: string) => (d ? new Date(d).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      align: "right" as const,
      render: (_: any, record) => (
        <Space>
                    <TTButton size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Edit
          </TTButton>
        </Space>
      ),
    },
  ];

  return (
    <TTTable
      rowKey={(r) => r.id}
      columns={columns as any}
      dataSource={data}
      pagination={{ pageSize: 10 }}
      dense
    />
  );
}
;
