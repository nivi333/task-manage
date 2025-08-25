import React from 'react';
import { Card } from 'antd';

interface ChartContainerProps {
  title: React.ReactNode;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, extra, children }) => {
  return (
    <Card title={title} extra={extra} bodyStyle={{ paddingTop: 12 }}>
      {children}
    </Card>
  );
};

export default ChartContainer;
