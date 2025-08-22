import React, { useState } from "react";
import { Form, Input, message } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { authAPI } from "../../services/authService";
import { TTButton } from "../common";

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (values: any) => {
    const formData = values as ForgotPasswordFormData;
    setLoading(true);

    try {
      await authAPI.forgotPassword({
        email: formData.email,
      });

      console.log("[NOTIFICATION] ForgotPasswordForm success");
      message.success("Password reset instructions sent to your email!");
      onSuccess(formData.email);
    } catch (error: any) {
      console.error("Forgot password error:", error);

      if (error.response?.status === 404) {
        console.log("[NOTIFICATION] ForgotPasswordForm error");
        message.error("No account found with this email address.");
      } else if (error.response?.status === 429) {
        console.log("[NOTIFICATION] ForgotPasswordForm error");
        message.error("Too many requests. Please try again later.");
      } else {
        console.log("[NOTIFICATION] ForgotPasswordForm error");
        message.error(
          error.response?.data?.message || "Failed to send reset email"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card tt-card-flat">
      <h1 className="auth-title">Forgot Password</h1>
      <p className="auth-subtitle">
        Enter your email address and we'll send you instructions to reset your
        password.
      </p>

      <Form
        className="auth-form"
        form={form}
        name="forgotPassword"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your email address!",
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                if (!validateEmail(value)) {
                  return Promise.reject(
                    new Error("Please enter a valid email address!")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email Address"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item>
          <TTButton ttVariant="primary" htmlType="submit" loading={loading} block>
            {loading ? "Sending..." : "Send Reset Instructions"}
          </TTButton>
        </Form.Item>
      </Form>

      <div className="back-to-login-container">
        <TTButton ttVariant="transparent" onClick={onBackToLogin} block>
          <ArrowLeftOutlined />
          Back to Login
        </TTButton>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
