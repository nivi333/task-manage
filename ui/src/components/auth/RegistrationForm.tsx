import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  message,
  Modal,
} from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import styled from "styled-components";
 
import { authAPI, RegisterRequest } from "../../services/authService";
import LoadingSpinner from "../common/LoadingSpinner";
import { useNavigate } from 'react-router-dom';

const RegistrationCard = styled.div`
  background: #fff;
  padding: 0;
  border-radius: 12px;
  /* Removed box-shadow for a flat, non-popping look */
  width: 100%;
  max-width: 430px;
  position: relative;
  margin-top: 0;
`;

 

const RegistrationTitle = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: #222;
  font-size: 28px;
  font-weight: 600;
`;

const TermsModal = ({
  visible,
  onOk,
  onCancel,
}: {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}) => (
  <Modal
    title="Terms & Conditions"
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    footer={null}
  >
    <p>
      By registering, you agree to our Terms and Conditions and Privacy Policy.
    </p>
    <Button type="primary" block onClick={onOk}>
      Accept
    </Button>
    <Button block onClick={onCancel} style={{ marginTop: 8 }}>
      Decline
    </Button>
  </Modal>
);


const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  

  const handleFinish = async (values: any) => {
    console.log('Submitting registration with values:', values);
    if (!values.acceptTerms) {
      message.error("You must accept the terms and conditions.");
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
        acceptTerms: values.acceptTerms,
      };
      console.log('Calling register API with payload:', req);
      const resp = await authAPI.register(req);
      console.log('Register API response:', resp);
      message.success("Registration successful!");
      form.resetFields();
      setAcceptedTerms(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTerms = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      // Open modal and ensure the box is not marked as accepted until user confirms
      setShowTerms(true);
      form.setFieldsValue({ acceptTerms: false });
    } else {
      setAcceptedTerms(false);
      form.setFieldsValue({ acceptTerms: false });
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

  

  return (
    <RegistrationCard>
      <RegistrationTitle>Register</RegistrationTitle>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onFinishFailed={({ errorFields }) => {
          if (errorFields && errorFields.length > 0) {
            message.error(errorFields[0].errors?.[0] || 'Please fix validation errors');
          }
        }}
        initialValues={{ acceptTerms: false }}
      >
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="First Name" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: "Last name is required" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Last Name" />
        </Form.Item>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Username is required" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Password is required" },
            { min: 8, message: "Password must be at least 8 characters" },
            {
              pattern: /^(?=.*[A-Z])(?=.*\d).+$/,
              message:
                "Password must contain at least one uppercase letter and one number",
            },
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
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
          />
        </Form.Item>

        <Form.Item
          name="acceptTerms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject("You must accept the terms and conditions"),
            },
          ]}
        >
          <Checkbox onChange={handleTerms}>
            I accept the{' '}
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#667eea', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setShowTerms(true)}
            >
              terms and conditions
            </button>
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={loading}>
            {loading ? (
              <LoadingSpinner text="Registering..." overlay={false} />
            ) : (
              "Register"
            )}
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="default" block onClick={() => navigate('/login')}>
            Back
          </Button>
        </Form.Item>
      </Form>

      <TermsModal
        visible={showTerms}
        onOk={handleAcceptTerms}
        onCancel={handleDeclineTerms}
      />
    </RegistrationCard>
  );
};

export default RegistrationForm;
