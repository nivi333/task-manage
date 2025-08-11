import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Typography } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text, Title } = Typography;

const ModalContent = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const TwoFactorIcon = styled.div`
  font-size: 48px;
  color: #52c41a;
  margin-bottom: 20px;
`;

const CodeInput = styled(Input)`
  font-size: 24px;
  text-align: center;
  letter-spacing: 8px;
  height: 60px;
  border-radius: 8px;
  margin: 20px 0;
`;

const HelpText = styled(Text)`
  color: #666;
  font-size: 14px;
  display: block;
  margin-bottom: 20px;
`;

interface TwoFactorModalProps {
  visible: boolean;
  onSuccess: (code: string) => void;
  onCancel: () => void;
  loading: boolean;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  visible,
  onSuccess,
  onCancel,
  loading
}) => {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (visible) {
      setCode('');
      setCountdown(30); // 30 second countdown for resend
    }
  }, [visible]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = () => {
    if (code.length !== 6) {
      message.error('Please enter a 6-digit code');
      return;
    }
    onSuccess(code);
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
  };

  const handleResendCode = () => {
    message.info('Resend functionality will be implemented soon');
    setCountdown(30);
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
      centered
      maskClosable={false}
    >
      <ModalContent>
        <TwoFactorIcon>
          <SafetyOutlined />
        </TwoFactorIcon>
        
        <Title level={3}>Two-Factor Authentication</Title>
        
        <HelpText>
          Enter the 6-digit code from your authenticator app
        </HelpText>

        <CodeInput
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="000000"
          maxLength={6}
          autoFocus
          onPressEnter={handleSubmit}
        />

        <div style={{ marginBottom: '20px' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            loading={loading}
            disabled={code.length !== 6}
            block
          >
            Verify Code
          </Button>
        </div>

        <div>
          <Text type="secondary">
            Didn't receive a code?{' '}
            <Button
              type="link"
              size="small"
              onClick={handleResendCode}
              disabled={countdown > 0}
              style={{ padding: 0 }}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </Button>
          </Text>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default TwoFactorModal;
