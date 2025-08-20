import React from 'react';
import { Typography } from 'antd';

export interface HeaderTitleProps {
  level?: 1 | 2 | 3 | 4 | 5;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ level = 3, children, style, className }) => {
  const { Title } = Typography;
  return (
    <Title level={level} style={{ margin: 0, ...(style || {}) }} className={className}>
      {children}
    </Title>
  );
};

export default HeaderTitle;
