import React, { useCallback, useMemo, useState } from 'react';
import { Mentions, Input, Form, Button } from 'antd';
import { TTButton } from '../common';

export interface CommentFormProps {
  submitting?: boolean;
  parentCommentId?: string | null;
  onSubmit: (content: string, parentCommentId?: string | null) => Promise<void> | void;
  onCancel?: () => void;
  mentionUsernames?: string[]; // initial suggestion list
  onMentionSearch?: (query: string) => Promise<string[]> | string[]; // async search hook
  initialValue?: string;
  rows?: number; // textarea rows (default 3)
}

const CommentForm: React.FC<CommentFormProps> = ({ submitting, parentCommentId = null, onSubmit, onCancel, mentionUsernames = [], onMentionSearch, initialValue, rows = 3 }) => {
  const [form] = Form.useForm();
  const [comment, setComment] = useState(initialValue || '');
  const [mentionSearch, setMentionSearch] = useState('');
  const [options, setOptions] = useState<string[]>(mentionUsernames);

  // Note: React 19 removed findDOMNode, which breaks react-quill v2.0.0.
  // Using a plain textarea fallback to avoid runtime errors.

  const handleSubmit = (values: { comment: string }) => {
    if (values.comment.trim()) {
      onSubmit(values.comment.trim(), parentCommentId);
      form.resetFields();
      setComment('');
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} initialValues={{ comment: initialValue || '' }}>
      <Form.Item
        name="comment"
        rules={[{ required: true, message: 'Please enter a comment.' }]}
        style={{ marginBottom: 8 }}
      >
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
          placeholder="Type @ to mention users"
          options={(options || [])
            .filter(u => !mentionSearch || u.toLowerCase().includes(mentionSearch.toLowerCase()))
            .slice(0, 8)
            .map(u => ({ value: u, label: u }))}
          style={{ width: '100%' }}
          rows={rows}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
              e.preventDefault();
              form.submit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              if (onCancel) onCancel();
              else {
                form.resetFields();
                setComment('');
              }
            }
          }}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <TTButton type="primary" htmlType="submit" loading={submitting}>
          Submit
        </TTButton>
        {onCancel && (
          <TTButton onClick={onCancel} style={{ marginLeft: 8 }}>
            Cancel
          </TTButton>
        )}
      </Form.Item>
    </Form>
  );
};

export default CommentForm;
