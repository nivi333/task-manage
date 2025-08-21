import React from 'react';
import { Card, Form, Select, Button, DatePicker } from 'antd';
import { TaskFilters } from '../../services/taskService';

const { Option } = Select;

interface FilterSidebarProps {
  onFilterChange: (filters: TaskFilters) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const filters: TaskFilters = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
    };
    onFilterChange(filters);
  };

  const onReset = () => {
    form.resetFields();
    onFilterChange({});
  };

  return (
    <Card title="Filters">
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Apply
          </Button>
          <Button onClick={onReset}>Reset</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FilterSidebar;
