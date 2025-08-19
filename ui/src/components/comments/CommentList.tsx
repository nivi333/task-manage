import React, { useMemo } from 'react';
import { List } from 'antd';
import { CommentModel } from '../../services/commentService';
import CommentItem from './CommentItem';

export interface CommentListProps {
  comments: CommentModel[];
  onReply: (content: string, parentId: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  mentionUsernames?: string[];
}

const CommentList: React.FC<CommentListProps> = ({ comments, onReply, onEdit, onDelete, mentionUsernames = [] }) => {
  const tree = useMemo(() => {
    const byParent: Record<string, CommentModel[]> = {};
    const roots: CommentModel[] = [];
    for (const c of comments) {
      const parent = c.parentCommentId || null;
      if (!parent) {
        roots.push(c);
      } else {
        const key = String(parent);
        byParent[key] = byParent[key] || [];
        byParent[key].push(c);
      }
    }
    return { roots, byParent };
  }, [comments]);

  const childrenOf = (id?: string) => (id ? (tree.byParent[String(id)] || []) : []);

  return (
    <List
      dataSource={tree.roots}
      renderItem={(c) => (
        <CommentItem
          key={String(c.id)}
          comment={c}
          childrenComments={childrenOf(String(c.id))}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          mentionUsernames={mentionUsernames}
        />
      )}
    />
  );
};

export default CommentList;
