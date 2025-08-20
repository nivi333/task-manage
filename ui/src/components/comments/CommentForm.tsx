import React, { useCallback, useMemo, useState } from 'react';
import { Mentions, Input } from 'antd';
import { TTButton } from '../common';

export interface CommentFormProps {
  submitting?: boolean;
  parentCommentId?: string | null;
  onSubmit: (content: string, parentCommentId?: string | null) => Promise<void> | void;
  onCancel?: () => void;
  mentionUsernames?: string[]; // initial suggestion list
  onMentionSearch?: (query: string) => Promise<string[]> | string[]; // async search hook
}

const CommentForm: React.FC<CommentFormProps> = ({ submitting, parentCommentId = null, onSubmit, onCancel, mentionUsernames = [], onMentionSearch }) => {
  const [value, setValue] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [options, setOptions] = useState<string[]>(mentionUsernames);

  // Note: React 19 removed findDOMNode, which breaks react-quill v2.0.0.
  // Using a plain textarea fallback to avoid runtime errors.

  const handleSubmit = useCallback(async () => {
    const text = value?.trim();
    if (!text) return;
    await onSubmit(text, parentCommentId);
    setValue('');
  }, [value, onSubmit, parentCommentId]);

  return (
    <div>
      <Input.TextArea
        rows={4}
        placeholder="Write a comment... (rich text temporarily disabled)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <TTButton type="primary" onClick={handleSubmit} loading={!!submitting} disabled={!!submitting}>
          {parentCommentId ? 'Reply' : 'Post Comment'}
        </TTButton>
        {onCancel && (
          <TTButton onClick={onCancel} disabled={!!submitting}>Cancel</TTButton>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <Mentions
          prefix="@"
          onSearch={async (val) => {
            setMentionSearch(val);
            if (onMentionSearch) {
              try {
                const res = await onMentionSearch(val);
                if (Array.isArray(res)) setOptions(res);
              } catch {
                // ignore
              }
            }
          }}
          onSelect={(opt) => {
            // Insert selected mention into editor as plain text
            setValue((prev) => `${prev} @${opt.value} `);
          }}
          placeholder="Type @ to mention users"
          options={(options || [])
            .filter(u => !mentionSearch || u.toLowerCase().includes(mentionSearch.toLowerCase()))
            .slice(0, 8)
            .map(u => ({ value: u, label: u }))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default CommentForm;
