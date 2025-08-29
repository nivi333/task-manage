import React, { useCallback, useEffect, useState } from "react";
import { Form } from "antd";
import { TTButton } from "../common";
import { notificationService } from "../../services/notificationService";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";

export interface CommentFormProps {
  submitting?: boolean;
  parentCommentId?: string | null;
  onSubmit: (
    content: string,
    parentCommentId?: string | null
  ) => Promise<void> | void;
  onCancel?: () => void;
  mentionUsernames?: string[]; // initial suggestion list
  onMentionSearch?: (query: string) => Promise<string[]> | string[]; // async search hook
  initialValue?: string;
  rows?: number; // textarea rows (default 3)
}

const CommentForm: React.FC<CommentFormProps> = ({
  submitting,
  parentCommentId = null,
  onSubmit,
  onCancel,
  mentionUsernames = [],
  onMentionSearch,
  initialValue,
  rows = 3,
}) => {
  const [form] = Form.useForm();

  // Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: "tiptap-mention",
        },
        suggestion: {
          items: async ({ query }: { query: string }) => {
            if (onMentionSearch) {
              try {
                const res = await onMentionSearch(query);
                return (Array.isArray(res) ? res : []).map((username) => ({ id: username, label: username }));
              } catch {
                return [];
              }
            }
            return mentionUsernames
              .filter((u) => !query || u.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 8)
              .map((username) => ({ id: username, label: username }));
          },
        },
      }),
    ],
    content: initialValue || "",
  });

  const handleSubmit = useCallback(async () => {
    if (!editor) return;
    const html = editor.getHTML();
    // Strip out empty HTML (e.g., <p></p>)
    const isEmpty = !html || /^<p>(<br\s*\/?\s*>)?<\/p>$/.test(html);
    if (isEmpty) return;

    // Extract all mentions from the HTML
    const mentionRegex = /<span[^>]*class=["']tiptap-mention["'][^>]*data-mention-id=["']([^"']+)["'][^>]*>[^<]*<\/span>/g;
    const foundMentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(html)) !== null) {
      foundMentions.push(match[1]);
    }
    // Check all mentions are valid
    const invalidMentions = foundMentions.filter(
      (m) => !mentionUsernames.includes(m)
    );
    if (invalidMentions.length > 0) {
      notificationService.error(
        `Invalid mention(s): ${invalidMentions.map((m) => `@${m}`).join(", ")}`
      );
      return;
    }

    await onSubmit(html, parentCommentId);
    editor.commands.clearContent();
    form.resetFields();
  }, [editor, onSubmit, parentCommentId, form, mentionUsernames]);

  useEffect(() => {
    if (editor && initialValue) {
      editor.commands.setContent(initialValue);
    }
  }, [editor, initialValue]);

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      style={{ width: "100%" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "85% 15%",
          gap: 8,
          alignItems: "start",
        }}
      >
        <Form.Item
          name="comment"
          rules={[{ required: true, message: "Please enter a comment." }]}
          style={{ marginBottom: 0 }}
        >
          <div className="tiptap-editor-wrapper">
            <EditorContent editor={editor} />
          </div>
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <TTButton type="primary" htmlType="submit" loading={submitting}>
            Submit
          </TTButton>
        </div>
      </div>
    </Form>
  );
};

export default CommentForm;
