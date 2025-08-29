import React, { useMemo, useState } from 'react';
import { Button, List, Popconfirm, Space, Typography } from 'antd';
import { Comment } from '../../types/comment';
import CommentForm from './CommentForm';
import UserAvatar from '../common/UserAvatar';

const { Text } = Typography;

export interface CommentItemProps {
  comment: Comment;
  childrenComments?: Comment[];
  onReply: (content: string, parentId: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  mentionUsernames?: string[];
  currentUserId?: string;
  isAdmin?: boolean;
  childrenOf?: (id?: string) => Comment[];
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, childrenComments = [], onReply, onEdit, onDelete, mentionUsernames = [], currentUserId, isAdmin, childrenOf }) => {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const createdAtStr = useMemo(() => (comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''), [comment.createdAt]);
  const canModify = useMemo(() => {
    const isAuthor = currentUserId && comment.author && String(comment.author.id) === String(currentUserId);
    return Boolean(isAdmin || isAuthor);
  }, [currentUserId, isAdmin, comment.author]);
  const repliesToShow = useMemo(() => {
    if (!childrenComments) return [] as Comment[];
    if (showAllReplies) return childrenComments;
    return childrenComments.slice(0, 2);
  }, [childrenComments, showAllReplies]);

  return (
    <List.Item
      key={comment.id}
      actions={[
        <Button key="reply" type="link" size="small" onClick={() => setReplying((v) => !v)}>Reply</Button>,
        canModify ? (
          <Button key="edit" type="link" size="small" onClick={() => setEditing((v) => !v)}>Edit</Button>
        ) : null,
        canModify ? (
          <Popconfirm key="delete" title="Delete this comment?" onConfirm={() => onDelete(String(comment.id))}>
            <Button type="link" size="small" danger>Delete</Button>
          </Popconfirm>
        ) : null,
      ].filter(Boolean) as any}
    >
      <List.Item.Meta
        avatar={<UserAvatar user={comment.author as any} />}
        title={<Space>
          <Text strong>{comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'Anonymous'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{createdAtStr}</Text>
        </Space>}
        description={
          editing ? (
            <CommentForm
              submitting={false}
              parentCommentId={null}
              onSubmit={async (html) => { await onEdit(String(comment.id), html); setEditing(false); }}
              onCancel={() => setEditing(false)}
              mentionUsernames={mentionUsernames}
            />
          ) : (
            <span className="tiptap-rendered-content" dangerouslySetInnerHTML={{ __html: comment.content }} />
          )
        }
      />

      {replying && (
        <div style={{ marginTop: 8, marginLeft: 48 }}>
          <CommentForm
            submitting={false}
            parentCommentId={String(comment.id)}
            onSubmit={async (html) => { await onReply(html, String(comment.id)); setReplying(false); }}
            onCancel={() => setReplying(false)}
            mentionUsernames={mentionUsernames}
          />
        </div>
      )}

      {childrenComments.length > 0 && (
        <List
          style={{ marginTop: 8, marginLeft: 48 }}
          dataSource={repliesToShow}
          renderItem={(child) => (
            <CommentItem
              key={String(child.id)}
              comment={child}
              childrenComments={childrenOf ? childrenOf(String(child.id)) : []}
              childrenOf={childrenOf}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              mentionUsernames={mentionUsernames}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          )}
        />
      )}

      {childrenComments.length > 2 && (
        <div style={{ marginTop: 4, marginLeft: 48 }}>
          <Button type="link" size="small" onClick={() => setShowAllReplies((v) => !v)}>
            {showAllReplies ? 'Show less' : `Show ${childrenComments.length - 2} more`}
          </Button>
        </div>
      )}
    </List.Item>
  );
};

export default CommentItem;
