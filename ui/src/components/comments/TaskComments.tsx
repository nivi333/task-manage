import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Empty, Spin } from 'antd';
import { Comment } from 'types/comment';
import { commentService } from 'services/commentService';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { webSocketService } from 'services/webSocketService';
import { stompService } from 'services/stompService';
import { notificationService } from 'services/notificationService';
import { userService } from 'services/userService';
import { authAPI } from 'services/authService';

interface TaskCommentsProps {
  taskId: string;
}

const POLL_INTERVAL_MS = 20000; // 20s fallback polling

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mentionUsernames, setMentionUsernames] = useState<string[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: string; username?: string; roles?: string[] } | null>(null);
  const lastSubmitAtRef = useRef<number>(0);
  const pollTimerRef = useRef<number | null>(null);

  // Load initial comments
  const fetchComments = useCallback(async () => {
    try {
      const list = await commentService.list(taskId as any);
      setComments(list);
    } catch (e) {
      // Errors are globally notified via interceptor
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Mentions bootstrap (optional list to start with)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await userService.getUsers({ size: 20 });
        if (mounted) setMentionUsernames(res.users.map(u => u.username));
      } catch {
        // ignore, suggestions are optional
      }
      try {
        if (!authAPI.isAuthenticated()) return;
        const me = await authAPI.getCurrentUser();
        if (mounted) setCurrentUser({ id: me?.id, username: me?.username, roles: me?.roles });
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Socket.io lifecycle (optional backend support)
  useEffect(() => {
    webSocketService.connect();
    webSocketService.joinTaskRoom(taskId);
    setSocketConnected(true);

    const handleNew = (c: any) => {
      setComments(prev => {
        // Avoid duplicates by id
        if (prev.some(p => String(p.id) === String(c.id))) return prev;
        return [...prev, c as Comment];
      });
      // Mention toast if current user is mentioned
      try {
        const uname = currentUser?.username;
        if (uname && typeof c?.content === 'string' && c.content.includes(`@${uname}`)) {
          notificationService.success(`You were mentioned in a comment`);
        }
      } catch {}
    };
    const handleUpdate = (c: any) => {
      setComments(prev => prev.map(p => String(p.id) === String(c.id) ? (c as Comment) : p));
    };
    const handleDelete = (id: string) => {
      setComments(prev => prev.filter(p => String(p.id) !== String(id)));
    };

    webSocketService.onNewComment(handleNew);
    webSocketService.onUpdateComment(handleUpdate);
    webSocketService.onDeleteComment(handleDelete);

    return () => {
      webSocketService.off('newComment');
      webSocketService.off('updateComment');
      webSocketService.off('deleteComment');
      webSocketService.leaveTaskRoom(taskId);
      setSocketConnected(false);
    };
  }, [taskId]);

  // STOMP (Spring) subscription lifecycle
  useEffect(() => {
    const unsubscribe = stompService.subscribeComments(taskId, (evt: any) => {
      if (!evt || !evt.type) return;
      if (evt.type === 'new' && evt.comment) {
        setComments(prev => {
          if (prev.some(p => String(p.id) === String(evt.comment.id))) return prev;
          return [...prev, evt.comment as Comment];
        });
        try {
          const uname = currentUser?.username;
          if (uname && typeof evt.comment?.content === 'string' && evt.comment.content.includes(`@${uname}`)) {
            notificationService.success('You were mentioned in a comment');
          }
        } catch {}
      } else if (evt.type === 'update' && evt.comment) {
        setComments(prev => prev.map(p => String(p.id) === String(evt.comment.id) ? (evt.comment as Comment) : p));
      } else if (evt.type === 'delete' && evt.id) {
        setComments(prev => prev.filter(p => String(p.id) !== String(evt.id)));
      }
    });
    return () => {
      try { unsubscribe && unsubscribe(); } catch {}
    };
  }, [taskId, currentUser?.username]);

  // Fallback polling
  useEffect(() => {
    // Always poll as a fallback; sockets may miss events
    fetchComments();
    pollTimerRef.current = window.setInterval(fetchComments, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
    };
  }, [fetchComments]);

  // Submit rate-limit: 1 action per 1.5s to avoid spam
  const canSubmitNow = () => Date.now() - lastSubmitAtRef.current > 1500;

  const create = useCallback(async (content: string, parentCommentId?: string | null) => {
    if (!content.trim()) {
      notificationService.error('Comment cannot be empty');
      return;
    }
    if (!canSubmitNow()) {
      notificationService.error('Please wait a moment before submitting again');
      return;
    }
    setSubmitting(true);
    lastSubmitAtRef.current = Date.now();

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentCommentId: parentCommentId || null,
      author: undefined,
    };
    setComments(prev => [...prev, optimistic]);

    try {
      const real = await commentService.create(taskId as any, { content, parentCommentId: parentCommentId || undefined });
      setComments(prev => prev.map(c => c.id === tempId ? real : c));
    } catch (e) {
      // Rollback optimistic
      setComments(prev => prev.filter(c => c.id !== tempId));
      // notification handled globally
    } finally {
      setSubmitting(false);
    }
  }, [taskId]);

  const edit = useCallback(async (commentId: string, content: string) => {
    if (!content.trim()) {
      notificationService.error('Comment cannot be empty');
      return;
    }
    if (!canSubmitNow()) {
      notificationService.error('Please wait a moment before submitting again');
      return;
    }
    setSubmitting(true);
    lastSubmitAtRef.current = Date.now();

    const prevSnapshot = comments;
    setComments(prev => prev.map(c => (String(c.id) === String(commentId) ? { ...c, content } : c)));
    try {
      const updated = await commentService.update(taskId as any, commentId as any, content);
      setComments(prev => prev.map(c => (String(c.id) === String(updated.id) ? updated : c)));
    } catch (e) {
      // rollback
      setComments(prevSnapshot);
    } finally {
      setSubmitting(false);
    }
  }, [comments, taskId]);

  const remove = useCallback(async (commentId: string) => {
    if (!canSubmitNow()) {
      notificationService.error('Please wait a moment before submitting again');
      return;
    }
    setSubmitting(true);
    lastSubmitAtRef.current = Date.now();

    const prevSnapshot = comments;
    setComments(prev => prev.filter(c => String(c.id) !== String(commentId)));
    try {
      await commentService.remove(taskId as any, commentId as any);
    } catch (e) {
      // rollback
      setComments(prevSnapshot);
    } finally {
      setSubmitting(false);
    }
  }, [comments, taskId]);

  const onMentionSearch = useCallback(async (query: string) => {
    try {
      const res = await userService.getUsers({ search: query, size: 8 });
      const names = res.users.map(u => u.username);
      setMentionUsernames(names);
      return names;
    } catch {
      return mentionUsernames;
    }
  }, [mentionUsernames]);

  const ariaLiveAnnouncement = useMemo(() => {
    return `There are ${comments.length} comments in the thread.`;
  }, [comments.length]);

  return (
    <Card title="Comments" bordered={false} style={{ marginTop: 16 }}>
      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)' }}>
        {ariaLiveAnnouncement}
      </div>
      {loading ? (
        <Spin />
      ) : (
        <>
          {comments.length === 0 ? (
            <Empty description="No comments yet. Start the discussion!" />
          ) : (
            <CommentList
              comments={comments}
              onReply={create}
              onEdit={edit}
              onDelete={remove}
              mentionUsernames={mentionUsernames}
              currentUserId={currentUser?.id as any}
              isAdmin={Array.isArray(currentUser?.roles) ? currentUser!.roles!.includes('ADMIN') : false}
            />
          )}
          <div style={{ marginTop: 12 }}>
            <CommentForm
              submitting={submitting}
              parentCommentId={null}
              onSubmit={create}
              mentionUsernames={mentionUsernames}
              onMentionSearch={onMentionSearch}
              rows={3}
            />
          </div>
        </>
      )}
    </Card>
  );
};

export default TaskComments;
