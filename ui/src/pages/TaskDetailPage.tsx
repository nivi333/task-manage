import React, { useEffect, useMemo, useState } from 'react';
import { Card, Descriptions, Space, Tag, Typography, Spin, Select, Divider, Input, Button as AntButton, Statistic, List, Avatar, Upload, Modal } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { Task } from '../types/task';
import { taskService } from '../services/taskService';
import Button from '../components/common/Button';
import { notificationService } from '../services/notificationService';
import { commentService, CommentModel } from '../services/commentService';
import { timeTrackingService } from '../services/timeTrackingService';
import { activityService, ActivityLogItem } from '../services/activityService';
import { attachmentService, Attachment } from '../services/attachmentService';
import { dependencyService, TaskDependency } from '../services/dependencyService';
import AppLayout from '../components/layout/AppLayout';

const { Text } = Typography;

const TaskDetailPage: React.FC = () => {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [trackingStart, setTrackingStart] = useState<number | null>(null);
  const [trackingStartIso, setTrackingStartIso] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [deps, setDeps] = useState<TaskDependency[]>([]);
  const [depsLoading, setDepsLoading] = useState(false);
  const [addDepVisible, setAddDepVisible] = useState(false);
  const [dependsOnId, setDependsOnId] = useState('');

  // Field-level validation and error state
  const [descError, setDescError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);

  const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'DONE'];
  const allowedPriorities = ['HIGH', 'MEDIUM', 'LOW'];

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const t = await taskService.get(id);
        setTask(t);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    const loadComments = async () => {
      if (!id) return;
      setCommentsLoading(true);
      try {
        const list = await commentService.list(id);
        setComments(list);
      } catch (e) {
        // errors surfaced globally
      } finally {
        setCommentsLoading(false);
      }
    };
    loadComments();
  }, [id]);

  useEffect(() => {
    const loadActivities = async () => {
      if (!id) return;
      setActivitiesLoading(true);
      try {
        const page = await activityService.listForTask(id, 0, 20);
        setActivities(page.content || []);
      } catch (e) {
        // handled globally
      } finally {
        setActivitiesLoading(false);
      }
    };
    loadActivities();
  }, [id]);

  useEffect(() => {
    // Attachments can be derived from task payload if present
    const atts = (task as any)?.attachments as Attachment[] | undefined;
    if (atts) setAttachments(atts);
  }, [task]);

  useEffect(() => {
    const loadDeps = async () => {
      if (!id) return;
      setDepsLoading(true);
      try {
        const all = await dependencyService.list();
        setDeps(all.filter(d => d.task?.id === id));
      } finally {
        setDepsLoading(false);
      }
    };
    loadDeps();
  }, [id]);

  const updateField = async (patch: Partial<Task>) => {
    if (!task || !id) return;
    setSaving(true);
    try {
      const updated = await taskService.update(id, patch as any);
      setTask(prev => ({ ...(prev as Task), ...updated }));
      notificationService.success('Task updated');
      // clear any field-specific errors for keys we just updated
      if (Object.prototype.hasOwnProperty.call(patch, 'description')) setDescError(null);
      if (Object.prototype.hasOwnProperty.call(patch, 'status')) setStatusError(null);
      if (Object.prototype.hasOwnProperty.call(patch, 'priority')) setPriorityError(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update task';
      notificationService.error(msg);
      // Map backend validation error (400) to specific field if possible
      if (e?.response?.status === 400) {
        if (Object.prototype.hasOwnProperty.call(patch, 'description')) setDescError(msg);
        if (Object.prototype.hasOwnProperty.call(patch, 'status')) setStatusError(msg);
        if (Object.prototype.hasOwnProperty.call(patch, 'priority')) setPriorityError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const elapsedSeconds = useMemo(() => (trackingStart ? Math.floor((Date.now() - trackingStart) / 1000) : 0), [trackingStart]);

  if (loading) return (
    <AppLayout title="Task Details" contentPadding={24}>
      <Spin />
    </AppLayout>
  );
  if (!task) return (
    <AppLayout title="Task Details" contentPadding={24}>
      Task not found.
    </AppLayout>
  );

  return (
    <AppLayout title={task.title || 'Task Details'} contentPadding={24}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Link to="/tasks"><Button>Back to Tasks</Button></Link>
      </div>

      <Card style={{ marginBottom: 16 }} loading={saving}>
        <Descriptions bordered size="middle" column={2}>
          <Descriptions.Item label="Status" span={1}>
            <Select
              size="small"
              style={{ minWidth: 160 }}
              value={task.status}
              onChange={(v) => {
                if (!allowedStatuses.includes(v)) {
                  setStatusError('Invalid status');
                  return;
                }
                setStatusError(null);
                updateField({ status: v });
              }}
              options={[{ label: 'Open', value: 'OPEN' }, { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Done', value: 'DONE' }]}
            />
            {statusError && <div><Text type="danger">{statusError}</Text></div>}
          </Descriptions.Item>
          <Descriptions.Item label="Priority" span={1}>
            <Select
              size="small"
              style={{ minWidth: 160 }}
              value={task.priority}
              onChange={(v) => {
                if (!allowedPriorities.includes(v)) {
                  setPriorityError('Invalid priority');
                  return;
                }
                setPriorityError(null);
                updateField({ priority: v as any });
              }}
              options={[{ label: 'High', value: 'HIGH' }, { label: 'Medium', value: 'MEDIUM' }, { label: 'Low', value: 'LOW' }]}
            />
            {priorityError && <div><Text type="danger">{priorityError}</Text></div>}
          </Descriptions.Item>
          <Descriptions.Item label="Due Date" span={1}>{task.dueDate ? new Date(task.dueDate).toLocaleString() : '-'}</Descriptions.Item>
          <Descriptions.Item label="Estimated Hours" span={1}>{task.estimatedHours ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Actual Hours" span={1}>{task.actualHours ?? 0}</Descriptions.Item>
          <Descriptions.Item label="Tags" span={1}>
            {task.tags?.length ? task.tags.map(t => <Tag key={t}>{t}</Tag>) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At" span={1}>{task.createdAt ? new Date(task.createdAt).toLocaleString() : '-'}</Descriptions.Item>
          <Descriptions.Item label="Updated At" span={1}>{task.updatedAt ? new Date(task.updatedAt).toLocaleString() : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Description" style={{ marginBottom: 16 }}>
        <Typography.Paragraph
          style={{ whiteSpace: 'pre-wrap' }}
          editable={{
            onChange: (v) => {
              const val = v ?? '';
              if (val.length > 5000) {
                setDescError('Description is too long (max 5000 characters)');
                return;
              }
              setDescError(null);
              updateField({ description: val });
            },
            tooltip: 'Click to edit description'
          }}
        >
          {task.description || <Text type="secondary">No description</Text>}
        </Typography.Paragraph>
        {descError && <Text type="danger">{descError}</Text>}
      </Card>

      <div style={{ height: 16 }} />

      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Card title="Time Tracking">
          <Space align="center" wrap>
            <Statistic title="Actual Hours" value={(task.actualHours ?? 0)} precision={2} />
            {trackingStart && (
              <Statistic title="Running" value={`${Math.floor(elapsedSeconds/3600)}h ${Math.floor((elapsedSeconds%3600)/60)}m ${elapsedSeconds%60}s`} />
            )}
            <AntButton
              type={trackingStart ? 'default' : 'primary'}
              onClick={async () => {
                if (!trackingStart) {
                  setTrackingStart(Date.now());
                  setTrackingStartIso(new Date().toISOString());
                } else {
                  const elapsedHrs = elapsedSeconds / 3600;
                  setTrackingStart(null);
                  const nowIso = new Date().toISOString();
                  // Persist time tracking entry
                  try {
                    if (id && trackingStartIso) {
                      await timeTrackingService.create({
                        task: { id },
                        startTime: trackingStartIso,
                        endTime: nowIso,
                        durationMinutes: Math.max(1, Math.ceil(elapsedSeconds / 60)),
                      });
                    }
                  } catch (e: any) {
                    notificationService.error('Failed to record time entry');
                  } finally {
                    setTrackingStartIso(null);
                  }
                  await updateField({ actualHours: (task.actualHours ?? 0) + Number(elapsedHrs.toFixed(2)) });
                }
              }}
            >
              {trackingStart ? 'Stop' : 'Start'}
            </AntButton>
          </Space>
        </Card>

        <Card title="Comments">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input.TextArea
              rows={3}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <AntButton
              type="primary"
              loading={postingComment}
              disabled={!newComment.trim()}
              onClick={async () => {
                if (!id || !newComment.trim()) return;
                setPostingComment(true);
                try {
                  await commentService.create(id, { content: newComment.trim() });
                  setNewComment('');
                  const list = await commentService.list(id);
                  setComments(list);
                  notificationService.success('Comment posted');
                } catch (e: any) {
                  notificationService.error('Failed to post comment');
                } finally {
                  setPostingComment(false);
                }
              }}
            >
              Post Comment
            </AntButton>
            <Divider />
            <List
              loading={commentsLoading}
              dataSource={comments}
              locale={{ emptyText: <Text type="secondary">No comments yet.</Text> as any }}
              renderItem={(c) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{(c.authorId || 'U').toString().slice(0, 1)}</Avatar>}
                    title={<Text strong>Comment</Text>}
                    description={<>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{c.content}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                      </Text>
                    </>}
                  />
                </List.Item>
              )}
            />
          </Space>
        </Card>

        <Card title="Activity" extra={<Text type="secondary">Latest</Text>}>
          <List
            loading={activitiesLoading}
            dataSource={activities}
            renderItem={(a) => (
              <List.Item>
                <List.Item.Meta
                  title={<>
                    <Text strong>{a.action}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>{new Date(a.timestamp).toLocaleString()}</Text>
                  </>}
                  description={<Text>{a.details}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>

        <Card title="Attachments">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload
              beforeUpload={async (file) => {
                try {
                  const att = await attachmentService.upload(file as File, id as string);
                  setAttachments(prev => [att, ...prev]);
                  notificationService.success('File uploaded');
                } catch (e) {
                  notificationService.error('Upload failed');
                }
                return false; // prevent default upload
              }}
              showUploadList={false}
            >
              <AntButton>Upload File</AntButton>
            </Upload>
            <List
              dataSource={attachments}
              locale={{ emptyText: <Text type="secondary">No attachments</Text> as any }}
              renderItem={(f) => (
                <List.Item
                  actions={[
                    <AntButton key="download" type="link" href={f.url} target="_blank" rel="noreferrer">Download</AntButton>,
                    <AntButton key="delete" type="link" onClick={async () => {
                      try {
                        await attachmentService.remove(f.fileName);
                        setAttachments(prev => prev.filter(x => x.fileName !== f.fileName));
                        notificationService.success('Deleted');
                      } catch {
                        notificationService.error('Delete failed');
                      }
                    }}>Delete</AntButton>,
                  ]}
                >
                  <List.Item.Meta
                    title={f.fileName}
                    description={<Text type="secondary">{f.fileType} • {Math.round((f.fileSize || 0)/1024)} KB</Text>}
                  />
                </List.Item>
              )}
            />
          </Space>
        </Card>

        <Card title="Dependencies"
          extra={<AntButton onClick={() => setAddDepVisible(true)}>Add Dependency</AntButton>}
        >
          <List
            loading={depsLoading}
            dataSource={deps}
            locale={{ emptyText: <Text type="secondary">No dependencies</Text> as any }}
            renderItem={(d) => (
              <List.Item actions={[
                <AntButton key="remove" type="link" onClick={async () => {
                  try {
                    await dependencyService.remove(d.id);
                    setDeps(prev => prev.filter(x => x.id !== d.id));
                    notificationService.success('Removed');
                  } catch {
                    notificationService.error('Failed to remove');
                  }
                }}>Remove</AntButton>,
              ]}>
                <List.Item.Meta
                  title={<>
                    <Text strong>Depends on:</Text> <Link to={`/tasks/${d.dependsOn.id}`}>{d.dependsOn.title || d.dependsOn.id}</Link>
                  </>}
                />
              </List.Item>
            )}
          />
          <Modal
            title="Add Dependency"
            open={addDepVisible}
            onCancel={() => setAddDepVisible(false)}
            onOk={async () => {
              if (!id || !dependsOnId.trim()) return;
              try {
                const created = await dependencyService.create(id, dependsOnId as any);
                setDeps(prev => [created, ...prev]);
                setDependsOnId('');
                setAddDepVisible(false);
                notificationService.success('Dependency added');
              } catch {
                notificationService.error('Failed to add');
              }
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>Enter the ID of the task this task depends on:</Text>
              <Input value={dependsOnId} onChange={(e) => setDependsOnId(e.target.value)} placeholder="Dependency Task UUID" />
            </Space>
          </Modal>
        </Card>

        <Card title="Subtasks">
          <List
            dataSource={(task as any)?.subTasks || []}
            locale={{ emptyText: <Text type="secondary">No subtasks</Text> as any }}
            renderItem={(st: any) => (
              <List.Item>
                <Link to={`/tasks/${st.id}`}>{st.title || st.id}</Link>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </AppLayout>
  );
};

export default TaskDetailPage;
