import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Form, Input, Button, Space, Upload, Avatar, Typography, Divider, Modal } from 'antd';
import { UploadOutlined, QrcodeOutlined, SaveOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import { ChangePasswordRequest, UpdateProfileRequest, UserProfile, TwoFAEnableResponse } from '../types/user';

const { Title, Text } = Typography;

function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

const UserProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [qrModal, setQrModal] = useState<{ open: boolean; data?: TwoFAEnableResponse }>({ open: false });

  const [form] = Form.useForm<UpdateProfileRequest>();
  const [pwdForm] = Form.useForm<ChangePasswordRequest>();

  const load = async () => {
    setLoading(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      form.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        profilePicture: data.profilePicture,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveProfile = async (values: UpdateProfileRequest) => {
    setLoading(true);
    try {
      const updated = await userService.updateProfile(values);
      setProfile(updated);
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values: ChangePasswordRequest) => {
    await userService.changePassword(values);
    pwdForm.resetFields();
  };

  const onEnable2FA = async () => {
    const data = await userService.enable2FA();
    setQrModal({ open: true, data });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Title level={3} style={{ margin: 0 }}>My Profile</Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title={<Space><UserOutlined /><Text strong>Profile Information</Text></Space>} loading={loading}>
              <Space align="start" size={16} style={{ width: '100%' }}>
                <Avatar size={72} src={profile?.profilePicture} icon={<UserOutlined />} />
                <div style={{ flex: 1 }}>
                  <Form form={form} layout="vertical" onFinish={onSaveProfile}>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'First name is required' }]}>
                          <Input placeholder="First name" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Last name is required' }]}>
                          <Input placeholder="Last name" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                          <Input placeholder="email@example.com" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username is required' }]}>
                          <Input placeholder="username" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item label="Profile Picture">
                      <Space>
                        <Upload
                          beforeUpload={async (file) => {
                            const b64 = await getBase64(file);
                            form.setFieldsValue({ profilePicture: b64 });
                            return false;
                          }}
                          showUploadList={false}
                        >
                          <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                        <Text type="secondary">Image will be stored as base64 and sent on save.</Text>
                      </Space>
                    </Form.Item>
                    <Form.Item name="profilePicture" hidden>
                      <Input type="hidden" />
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Save Changes</Button>
                        <Button htmlType="button" onClick={() => form.resetFields()}>Reset</Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title={<Space><LockOutlined /><Text strong>Change Password</Text></Space>}>
              <Form form={pwdForm} layout="vertical" onFinish={onChangePassword}>
                <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true, message: 'Current password is required' }]}>
                  <Input.Password placeholder="Current password" />
                </Form.Item>
                <Form.Item name="newPassword" label="New Password" rules={[
                  { required: true, message: 'New password is required' },
                  { min: 8, message: 'Must be at least 8 characters' },
                ]}>
                  <Input.Password placeholder="New password" />
                </Form.Item>
                <Form.Item name="confirmPassword" label="Confirm Password" dependencies={["newPassword"]} rules={[
                  { required: true, message: 'Please confirm new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error('Passwords do not match'));
                    }
                  })
                ]}>
                  <Input.Password placeholder="Confirm password" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Update Password</Button>
                </Form.Item>
              </Form>
            </Card>

            <Divider />

            <Card title={<Space><QrcodeOutlined /><Text strong>Two-Factor Authentication</Text></Space>}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>Secure your account by enabling 2FA.</Text>
                <Button onClick={onEnable2FA} icon={<QrcodeOutlined />}>Enable 2FA</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>

      <Modal
        title="Scan this QR to complete 2FA setup"
        open={qrModal.open}
        onCancel={() => setQrModal({ open: false })}
        footer={<Button onClick={() => setQrModal({ open: false })}>Close</Button>}
      >
        {qrModal.data?.qrImageUrl ? (
          <div style={{ textAlign: 'center' }}>
            <img src={qrModal.data.qrImageUrl} alt="2FA QR" style={{ maxWidth: '100%' }} />
            {qrModal.data.secretKey && <Text type="secondary">Secret: {qrModal.data.secretKey}</Text>}
          </div>
        ) : (
          <Space direction="vertical">
            {qrModal.data?.secretKey && <Text strong>Secret Key: {qrModal.data.secretKey}</Text>}
            <Text>{qrModal.data?.message || '2FA is now enabled.'}</Text>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default UserProfilePage;
