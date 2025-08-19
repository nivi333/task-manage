import React, { useCallback, useMemo, useState } from 'react';
import { Button, Mentions } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'code-block'],
      ['clean'],
    ],
  }), []);

  const handleSubmit = useCallback(async () => {
    const html = value?.trim();
    // Strip tags to validate non-empty content
    const text = html.replace(/<[^>]*>/g, '').trim();
    if (!text) return;
    await onSubmit(html, parentCommentId);
    setValue('');
  }, [value, onSubmit, parentCommentId]);

  return (
    <div>
      <ReactQuill theme="snow" value={value} onChange={setValue} modules={modules} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={handleSubmit} loading={!!submitting} disabled={!!submitting}>
          {parentCommentId ? 'Reply' : 'Post Comment'}
        </Button>
        {onCancel && (
          <Button onClick={onCancel} disabled={!!submitting}>Cancel</Button>
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
