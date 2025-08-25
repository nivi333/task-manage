import React, { useEffect, useMemo, useState } from "react";
import { Modal, List, Button, Space, Typography, Popconfirm, Divider, Form, Select, Tag, Empty, Input } from "antd";
import { EditOutlined, MergeCellsOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import tagsService, { TagSummary } from "services/tagsService";
import { SearchBar } from "../common";

interface TagsManageModalProps {
  open: boolean;
  onClose: () => void;
  onChanged?: () => void; // notify parent to refresh tag-dependent data
}

const normalizeDisplay = (name: string) => name.trim().replace(/\s+/g, " ");

const TagsManageModal: React.FC<TagsManageModalProps> = ({ open, onClose, onChanged }) => {
  const [allTags, setAllTags] = useState<TagSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [mergeForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const list = await tagsService.list();
      setAllTags(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [allTags, query]);

  const beginRename = (name: string) => {
    setRenaming(name);
    setRenameValue(normalizeDisplay(name));
  };

  const submitRename = async () => {
    if (!renaming) return;
    const oldName = renaming;
    const newRaw = renameValue;
    const normalized = tagsService.normalize(newRaw);
    if (!normalized || normalized.length < 1 || normalized.length > 32) return;
    await tagsService.rename(oldName, normalizeDisplay(newRaw));
    setRenaming(null);
    setRenameValue("");
    await load();
    onChanged?.();
    window.dispatchEvent(new Event('taglist:changed'));
  };

  const confirmDelete = async (name: string) => {
    await tagsService.delete(name);
    await load();
    onChanged?.();
    window.dispatchEvent(new Event('taglist:changed'));
  };

  const submitMerge = async () => {
    const values = await mergeForm.validateFields();
    const from = values.from as string;
    const toRaw = values.to as string;
    if (!from || !toRaw) return;
    await tagsService.merge(from, normalizeDisplay(toRaw));
    mergeForm.resetFields();
    await load();
    onChanged?.();
    window.dispatchEvent(new Event('taglist:changed'));
  };

  return (
    <Modal
      open={open}
      title="Manage Tags"
      onCancel={onClose}
      onOk={onClose}
      width={720}
      footer={null}
      destroyOnClose
      className="tt-modal-tight"
    >
      <Space style={{ width: "100%" }} direction="vertical" size={12}>
        <Space style={{ width: "100%", justifyContent: "space-between" }} align="center">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search tags"
            width={280}
          />
          <Button icon={<ReloadOutlined />} onClick={() => load()} loading={loading}>
            Refresh
          </Button>
        </Space>

        <Typography.Title level={5} style={{ margin: 0 }}>
          All Tags {allTags.length > 0 && <Tag color="blue">{allTags.length}</Tag>}
        </Typography.Title>
        {filtered.length === 0 ? (
          <Empty description="No tags found" />
        ) : (
          <List
            bordered
            loading={loading}
            dataSource={filtered}
            renderItem={(item) => (
              <List.Item
                actions={[
                  renaming === item.name ? (
                    <Space key="rename-actions">
                      <Button size="small" type="primary" onClick={submitRename}>Save</Button>
                      <Button size="small" onClick={() => setRenaming(null)}>Cancel</Button>
                    </Space>
                  ) : (
                    <Button key="rename" icon={<EditOutlined />} size="small" onClick={() => beginRename(item.name)}>
                      Rename
                    </Button>
                  ),
                  <Popconfirm
                    key="delete"
                    title={`Delete tag "${item.name}"?`}
                    description={`This will remove the tag from all tasks (${item.count} occurrences).`}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => confirmDelete(item.name)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
                  </Popconfirm>,
                ]}
              >
                <Space>
                  {renaming === item.name ? (
                    <Input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      maxLength={32}
                      style={{ width: 260 }}
                      status={(() => {
                        const n = tagsService.normalize(renameValue);
                        if (!n || n.length < 1 || n.length > 32) return "error" as any;
                        const dup = allTags.some((t) => tagsService.normalize(t.name) === n && tagsService.normalize(item.name) !== n);
                        return dup ? ("error" as any) : ("" as any);
                      })()}
                    />
                  ) : (
                    <Typography.Text>
                      {item.name} <Tag>{item.count}</Tag>
                    </Typography.Text>
                  )}
                </Space>
              </List.Item>
            )}
          />
        )}

        <Divider>Merge Tags</Divider>
        <Form form={mergeForm} layout="inline" onFinish={submitMerge}>
          <Form.Item name="from" rules={[{ required: true, message: "Select source tag" }]}> 
            <Select
              placeholder="From"
              showSearch
              style={{ minWidth: 200 }}
              options={allTags.map((t) => ({ label: `${t.name} (${t.count})`, value: t.name }))}
              filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item
            name="to"
            rules={[
              { required: true, message: "Enter destination tag" },
              {
                validator: (_, value) => {
                  const n = tagsService.normalize(value || "");
                  if (!n || n.length < 1 || n.length > 32) return Promise.reject("1-32 chars, no leading/trailing, single spaces");
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="To" style={{ minWidth: 220 }} maxLength={32} />
          </Form.Item>
          <Form.Item>
            <Popconfirm
              title="Merge tags?"
              description="This will replace the source tag on all tasks."
              onConfirm={submitMerge}
              okText="Merge"
              icon={<MergeCellsOutlined />}
            >
              <Button type="primary" icon={<MergeCellsOutlined />}>Merge</Button>
            </Popconfirm>
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
};

export default TagsManageModal;
