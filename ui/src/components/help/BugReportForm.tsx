import React from "react";
import { Button, Form, Input, Select } from "antd";
import { bugService, BugReportPayload } from "../../services/bugService";

const { TextArea } = Input;

export interface BugReportFormProps {
  onSubmitted?: () => void;
}

const BugReportForm: React.FC<BugReportFormProps> = ({ onSubmitted }) => {
  const [form] = Form.useForm<BugReportPayload>();
  const [submitting, setSubmitting] = React.useState(false);

  const onFinish = async (values: BugReportPayload) => {
    setSubmitting(true);
    try {
      const ok = await bugService.submit(values);
      if (ok) {
        form.resetFields();
        onSubmitted?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      validateMessages={{ required: "${label} is required" }}
    >
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input placeholder="Short summary of the issue" aria-label="Bug title" />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true }]}>
        <TextArea rows={4} placeholder="Describe what happened" aria-label="Bug description" />
      </Form.Item>
      <Form.Item name="steps" label="Steps to Reproduce">
        <TextArea rows={3} placeholder="1) ... 2) ... 3) ..." aria-label="Steps to reproduce" />
      </Form.Item>
      <Form.Item name="severity" label="Severity" initialValue="medium">
        <Select
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
          ]}
          aria-label="Severity"
        />
      </Form.Item>
      <Form.Item name="contactEmail" label="Your Email (optional)">
        <Input type="email" placeholder="you@example.com" aria-label="Contact email" />
      </Form.Item>
      <Form.Item>
        <Button className="tt-help-submit" type="primary" htmlType="submit" loading={submitting}>
          Submit Bug Report
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BugReportForm;
