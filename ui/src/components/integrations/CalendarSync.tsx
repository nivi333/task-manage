import React, { useState } from "react";
import { Card, Form, Input, DatePicker, Button, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { CalendarOutlined } from "@ant-design/icons";
import { calendarIntegrationService } from "../../services/calendarIntegrationService";
import { notificationService } from "../../services/notificationService";

const { RangePicker } = DatePicker;

const CalendarSync: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const [start, end]: [Dayjs, Dayjs] = values.range;
    try {
      setLoading(true);
      const msg = await calendarIntegrationService.createEvent({
        title: values.title,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      notificationService.success(msg || "Event created in calendar");
      form.resetFields();
    } catch (e: any) {
      notificationService.error(
        e?.response?.data?.message || "Failed to create calendar event"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<span><CalendarOutlined /> Calendar Sync</span>}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{
        range: [dayjs().add(1, "hour"), dayjs().add(2, "hour")],
      }}>
        <Form.Item label="Event Title" name="title" rules={[{ required: true, message: "Please enter a title" }]}>
          <Input placeholder="e.g., Project kickoff" />
        </Form.Item>
        <Form.Item label="Start and End" name="range" rules={[{ required: true, message: "Please select time range" }]}>
          <RangePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Space>
          <Button htmlType="submit" type="primary" loading={loading}>Create Event</Button>
          <Button onClick={() => form.resetFields()}>Reset</Button>
        </Space>
      </Form>
    </Card>
  );
};

export default CalendarSync;
