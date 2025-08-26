import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Form, Select, DatePicker, Divider, Space } from "antd";
import { TaskFilters } from "../../services/taskService";
import tagsService from "../../services/tagsService";
import TagsManageButton from "../tags/TagsManageButton";

const { Option } = Select;

interface FilterSidebarProps {
  onFilterChange: (filters: TaskFilters) => void;
  onApplied?: () => void;
}

export interface FilterSidebarRef {
  submit: () => void;
  reset: () => void;
}

const FilterSidebar = forwardRef<FilterSidebarRef, FilterSidebarProps>(
  ({ onFilterChange, onApplied }, ref) => {
    const [form] = Form.useForm();
    const [tagOptions, setTagOptions] = useState<string[]>([]);
    const [manageOpenKey, setManageOpenKey] = useState(0); // change to force re-mount modal

    const onFinish = (values: any) => {
      const filters: TaskFilters = {
        ...values,
        dueDate: values.dueDate
          ? values.dueDate.format("YYYY-MM-DD")
          : undefined,
      };
      onFilterChange(filters);
      onApplied && onApplied();
    };

    const onReset = () => {
      form.resetFields();
      onFilterChange({});
    };

    useImperativeHandle(ref, () => ({
      submit: () => form.submit(),
      reset: onReset,
    }));

    useEffect(() => {
      const loadTags = async () => {
        try {
          const names = await tagsService.names();
          setTagOptions(names);
        } catch (e) {
          // handled globally
        }
      };
      loadTags();
    }, [manageOpenKey]);

    return (
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ padding: 12 }}>
        <Form.Item name="status" label="Status">
          <Select placeholder="Select status" allowClear>
            <Option value="OPEN">Open</Option>
            <Option value="IN_PROGRESS">In Progress</Option>
            <Option value="DONE">Done</Option>
          </Select>
        </Form.Item>
        <Form.Item name="priority" label="Priority">
          <Select placeholder="Select priority" allowClear>
            <Option value="HIGH">High</Option>
            <Option value="MEDIUM">Medium</Option>
            <Option value="LOW">Low</Option>
          </Select>
        </Form.Item>
        <Form.Item name="dueDate" label="Due Date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="tags" label="Tags">
          <Select
            mode="multiple"
            placeholder="Select tags"
            allowClear
            options={tagOptions.map((t) => ({ label: t, value: t }))}
            dropdownRender={(menu) => (
              <div>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ padding: "0 8px 8px" }}>
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#888" }}>Can't find a tag?</span>
                    <TagsManageButton label="Manage Tags" />
                  </Space>
                </div>
              </div>
            )}
            onDropdownVisibleChange={(open) => {
              if (!open) return;
              // refresh options each time dropdown opens
              tagsService
                .names()
                .then(setTagOptions)
                .catch(() => {});
            }}
          />
        </Form.Item>
      </Form>
    );
  }
);

export default FilterSidebar;
