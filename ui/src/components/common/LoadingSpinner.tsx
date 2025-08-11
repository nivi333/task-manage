import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const SpinnerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const SpinnerContainer = styled.div`
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const LoadingText = styled.div`
  margin-top: 16px;
  color: #666;
  font-size: 14px;
`;

const antIcon = <LoadingOutlined style={{ fontSize: 32, color: '#1890ff' }} spin />;

interface LoadingSpinnerProps {
  text?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...', 
  overlay = true 
}) => {
  const spinner = (
    <SpinnerContainer>
      <Spin indicator={antIcon} />
      <LoadingText>{text}</LoadingText>
    </SpinnerContainer>
  );

  if (overlay) {
    return <SpinnerOverlay>{spinner}</SpinnerOverlay>;
  }

  return spinner;
};

export default LoadingSpinner;
