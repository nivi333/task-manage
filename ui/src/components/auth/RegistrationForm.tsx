import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Upload, Modal } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { UserOutlined, LockOutlined, MailOutlined, SmileOutlined, UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { authAPI, RegisterRequest } from '../../services/authService';
import LoadingSpinner from '../common/LoadingSpinner';

const RegistrationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
  padding: 20px;
`;

const RegistrationCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 430px;
`;

const RegistrationTitle = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
  font-weight: 600;
`;

const TermsModal = ({ visible, onOk, onCancel }: { visible: boolean; onOk: () => void; onCancel: () => void }) => (
  <Modal title="Terms & Conditions" open={visible} onOk={onOk} onCancel={onCancel} footer={null}>
    <p>By registering, you agree to our Terms and Conditions and Privacy Policy.</p>
    <Button type="primary" block onClick={onOk}>Accept</Button>
    <Button block onClick={onCancel} style={{ marginTop: 8 }}>Decline</Button>
  </Modal>
);

const RegistrationForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleFinish = async (values: any) => {
    if (!acceptedTerms) {
      message.error('You must accept the terms and conditions.');
      return;
    }
    setLoading(true);
    try {
      const req: RegisterRequest = {
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        acceptTerms: acceptedTerms,
      };
      await authAPI.register(req);
      message.success('Registration successful! Please check your email for verification.');
      form.resetFields();
      setAcceptedTerms(false);
      setProfilePic(null);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTerms = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setShowTerms(true);
    } else {
      setAcceptedTerms(false);
    }
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setShowTerms(false);
    form.setFieldsValue({ acceptTerms: true });
  };

  const handleDeclineTerms = () => {
    setAcceptedTerms(false);
    setShowTerms(false);
    form.setFieldsValue({ acceptTerms: false });
  };

  const beforeUpload = (file: any) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Only image files are allowed!');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => setProfilePic(e.target.result);
    reader.readAsDataURL(file);
    return false; // prevent upload
  };

  return (
    <RegistrationContainer>
      <RegistrationCard>
        <RegistrationTitle>
          <SmileOutlined style={{ color: '#f7971e', marginRight: 8 }} />
          Register
        </RegistrationTitle>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ acceptTerms: false }}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'First name is required' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="First Name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Last name is required' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Last Name" />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Username is required' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 8, message: 'Password must be at least 8 characters' },
              { pattern: /^(?=.*[A-Z])(?=.*\d).+$/, message: 'Password must contain at least one uppercase letter and one number' },
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item
            name="profilePic"
            label="Profile Picture (optional)"
            valuePropName="fileList"
            getValueFromEvent={() => profilePic ? [{ url: profilePic }] : []}
          >
            <Upload
              beforeUpload={beforeUpload}
              showUploadList={!!profilePic}
              listType="picture-card"
              maxCount={1}
            >
              {profilePic ? <img src={profilePic} alt="avatar" style={{ width: '100%' }} /> : <UploadOutlined />}
            </Upload>
          </Form.Item>
          <Form.Item
            name="acceptTerms"
            valuePropName="checked"
            rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('You must accept the terms and conditions') }]}
          >
            <Checkbox checked={acceptedTerms} onChange={handleTerms}>
              I accept the <a onClick={() => setShowTerms(true)}>terms and conditions</a>
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={loading}>
              {loading ? <LoadingSpinner text="Registering..." overlay={false} /> : 'Register'}
            </Button>
          </Form.Item>
        </Form>
        <TermsModal visible={showTerms} onOk={handleAcceptTerms} onCancel={handleDeclineTerms} />
      </RegistrationCard>
    </RegistrationContainer>
  );
};

export default RegistrationForm;
