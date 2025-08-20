import React from 'react';
import { Card, List, Tag } from 'antd';
import { TaskSummaryItem } from '../../types/project';

interface Props {
  items: TaskSummaryItem[];
}

const statusColor = (s: string) => {
  if (s === 'DONE') return 'green';
  if (s === 'IN_PROGRESS') return 'purple';
  if (s === 'OPEN') return 'gold';
  return 'blue';
};

const TaskSummary: React.FC<Props> = ({ items }) => {
  return (
    <Card title="Task Summary">
      <List
        dataSource={items}
        renderItem={(it) => (
          <List.Item>
            <List.Item.Meta
              title={<Tag color={statusColor(it.status)}>{it.status.replace('_', ' ')}</Tag>}
              description={`${it.count} tasks`}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TaskSummary;
