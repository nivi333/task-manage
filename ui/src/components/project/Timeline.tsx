import React from 'react';
import { Card, Timeline as AntdTimeline } from 'antd';

interface TimelineItem {
  date: string; // ISO
  label: string;
}

interface Props {
  items?: TimelineItem[];
}

const Timeline: React.FC<Props> = ({ items = [] }) => {
  return (
    <Card title="Timeline">
      <AntdTimeline
        items={(items || []).map(it => ({
          color: 'blue',
          children: `${new Date(it.date).toLocaleDateString()} — ${it.label}`,
        }))}
      />
      {(!items || items.length === 0) && (
        <div style={{ textAlign: 'center', color: '#999' }}>No timeline entries</div>
      )}
    </Card>
  );
};

export default Timeline;
