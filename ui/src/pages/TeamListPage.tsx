import React, { useEffect, useState } from 'react';
import { Card, Button, Spin, Alert, Modal } from 'antd';
import TeamSettingsDrawer from '../components/team/TeamSettingsDrawer';
import TTTable from '../components/common/TTTable';
import AppLayout from '../components/layout/AppLayout';
import TeamCreateForm from './TeamCreatePage';
import { useNavigate } from 'react-router-dom';
import { teamService } from "../services/teamService";
import { Team } from '../types/team';

const TeamListPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        // If there is a list endpoint, use it. Otherwise, fallback to showing nothing.
        const data = await teamService.list();
        setTeams(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (loading) return <Spin size="large" style={{ margin: 64, display: 'block' }} />;
  if (error) return <Alert message={error} type="error" showIcon style={{ margin: 32 }} />;

  return (
    <AppLayout title="Teams">
      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 }}>
          <Button type="primary" onClick={() => setCreateModalOpen(true)}>
            Create New Team
          </Button>
        </div>
        <Modal
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          footer={null}
          destroyOnClose
          title="Create Team"
        >
          <TeamCreateForm onSuccess={() => { setCreateModalOpen(false); }} onCancel={() => setCreateModalOpen(false)} />
        </Modal>
        <TTTable
          dataSource={teams.filter(t => t && t.id && t.name)}
          rowKey="id"
          columns={[
            {
              title: 'Team Name',
              dataIndex: 'name',
              key: 'name',
              render: (text: string, record: Team) => (
                <span style={{ fontWeight: 500 }}>{text}</span>
              ),
            },
            {
              title: 'Description',
              dataIndex: 'description',
              key: 'description',
              render: (desc: string) => desc || <span style={{ color: '#aaa' }}>No description</span>,
            },
            {
              title: 'Members',
              dataIndex: 'memberCount',
              key: 'memberCount',
              align: 'center' as const,
              render: (count: number) => <span>{count ?? 0}</span>,
            },
            {
              title: 'Actions',
              key: 'actions',
              align: 'center' as const,
              render: (_: any, record: Team) => (
                <Button type="link" onClick={() => {
                  setSelectedTeam(record);
                  setSettingsDrawerOpen(true);
                }}>
                  Manage
                </Button>
              ),
            },
          ]}
          locale={{ emptyText: 'No teams found.' }}
          style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 8px #f0f1f2', marginTop: 8 }}
        />
      </Card>
      <TeamSettingsDrawer
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        team={selectedTeam}
        linkedProjects={[]}
        linkedTasks={[]}
      />
    </AppLayout>
  );
};

export default TeamListPage;
