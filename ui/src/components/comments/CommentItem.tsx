import React, { useMemo, useState } from 'react';
import { Avatar, Button, List, Popconfirm, Space, Typography } from 'antd';
import { Comment } from '../../types/comment';
import CommentForm from './CommentForm';

const { Text } = Typography;

export interface CommentItemProps {
  comment: Comment;
  childrenComments?: Comment[];
  onReply: (content: string, parentId: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  mentionUsernames?: string[];
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, childrenComments = [], onReply, onEdit, onDelete, mentionUsernames = [] }) => {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const createdAtStr = useMemo(() => (comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''), [comment.createdAt]);

  return (
    <List.Item
      key={comment.id}
      actions={[
        <Button key="reply" type="link" size="small" onClick={() => setReplying((v) => !v)}>Reply</Button>,
        <Button key="edit" type="link" size="small" onClick={() => setEditing((v) => !v)}>Edit</Button>,
        <Popconfirm key="delete" title="Delete this comment?" onConfirm={() => onDelete(String(comment.id))}>
          <Button type="link" size="small" danger>Delete</Button>
        </Popconfirm>,
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar>{(comment.author?.username || 'U').slice(0, 1).toUpperCase()}</Avatar>}
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
            <Text style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Text>
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
          dataSource={childrenComments}
          renderItem={(child) => (
            <CommentItem
              key={String(child.id)}
              comment={child}
              childrenComments={[]}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              mentionUsernames={mentionUsernames}
            />
          )}
        />
      )}
    </List.Item>
  );
};

export default CommentItem;
