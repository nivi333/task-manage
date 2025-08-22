import React, { useState, useEffect, useCallback } from "react";
import { Divider, Typography, Alert } from "antd";
import { commentService } from "services/commentService";
import { Comment as CommentModel } from "types/comment";
import CommentList from "components/comments/CommentList";
import CommentForm from "components/comments/CommentForm";
import { notificationService } from "services/notificationService";
import { webSocketService } from "services/webSocketService";

const { Title } = Typography;

type Props = { taskId: string; compact?: boolean };

const CommentSection: React.FC<Props> = ({ taskId, compact }) => {
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedComments = await commentService.list(taskId);
      setComments(fetchedComments.filter((c) => c.id));
      setError(null);
    } catch (err) {
      setError("Failed to load comments.");
      notificationService.error("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();

    webSocketService.connect();
    webSocketService.joinTaskRoom(taskId);

    webSocketService.onNewComment((comment) => {
      setComments((prevComments) => [...prevComments, comment]);
    });

    webSocketService.onUpdateComment((updatedComment) => {
      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === updatedComment.id ? updatedComment : c
        )
      );
    });

    webSocketService.onDeleteComment((commentId) => {
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== commentId)
      );
    });

    return () => {
      webSocketService.leaveTaskRoom(taskId);
      webSocketService.disconnect();
    };
  }, [fetchComments, taskId]);

  const handleCommentSubmit = async (
    content: string,
    parentCommentId?: string | null
  ) => {
    try {
      await commentService.create(taskId, { content, parentCommentId });
      notificationService.success("Comment posted successfully!");
      fetchComments(); // Refresh comments after posting
    } catch (err) {
      notificationService.error("Failed to post comment.");
    }
  };

  const handleCommentEdit = async (commentId: string, content: string) => {
    try {
      await commentService.update(taskId, commentId, content);
      notificationService.success("Comment updated successfully!");
      fetchComments();
    } catch (err) {
      notificationService.error("Failed to update comment.");
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      await commentService.remove(taskId, commentId);
      notificationService.success("Comment deleted successfully!");
      fetchComments();
    } catch (err) {
      notificationService.error("Failed to delete comment.");
    }
  };

  if (compact) {
    return (
      <div style={{ margin: 0 }}>
        <CommentForm onSubmit={handleCommentSubmit} rows={2} />
        {loading && <p style={{ margin: "8px 0" }}>Loading comments...</p>}
        {error && (
          <Alert
            style={{ margin: "8px 0" }}
            message={error}
            type="error"
            showIcon
          />
        )}
        {!loading && !error && (
          <CommentList
            comments={comments}
            onReply={handleCommentSubmit}
            onEdit={handleCommentEdit}
            onDelete={handleCommentDelete}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <Title level={4}>Comments</Title>
      <Divider />
      <CommentForm onSubmit={handleCommentSubmit} />
      <Divider />
      {loading && <p>Loading comments...</p>}
      {error && <Alert message={error} type="error" showIcon />}
      {!loading && !error && (
        <CommentList
          comments={comments}
          onReply={handleCommentSubmit}
          onEdit={handleCommentEdit}
          onDelete={handleCommentDelete}
        />
      )}
    </div>
  );
};
export default CommentSection;
