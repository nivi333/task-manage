import React, { useState } from "react";
import { Form, Input, message } from "antd";
import { LockOutlined, ArrowLeftOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { authAPI } from "../../services/authService";
import { TTButton } from "../common";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onSuccess,
  onBackToLogin,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, one uppercase, one lowercase, one digit, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (values: any) => {
    const formData = values as ResetPasswordFormData;
    setLoading(true);

    try {
      await authAPI.resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      console.log("[NOTIFICATION] ResetPasswordForm success");
      message.success("Password reset successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Reset password error:", error);

      if (error.response?.status === 400) {
        console.log("[NOTIFICATION] ResetPasswordForm error");
        message.error("Invalid or expired reset token. Please request a new one.");
      } else if (error.response?.status === 422) {
        console.log("[NOTIFICATION] ResetPasswordForm error");
        message.error("Password validation failed. Please check requirements.");
      } else {
        console.log("[NOTIFICATION] ResetPasswordForm error");
        message.error(
          error.response?.data?.message || "Failed to reset password"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Reset Password</h1>
      <p className="auth-subtitle">
        Enter your new password below.
      </p>

      <Form
        className="auth-form"
        form={form}
        name="resetPassword"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: "Please input your new password!" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                if (!validatePassword(value)) {
                  return Promise.reject(
                    new Error(
                      "Password must be at least 8 characters with uppercase, lowercase, digit, and special character!"
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        {password && (
          <Form.Item>
            <PasswordStrengthMeter password={password} />
          </Form.Item>
        )}

        <Form.Item
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The passwords do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm New Password"
            autoComplete="new-password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item>
          <TTButton ttVariant="primary" htmlType="submit" loading={loading} block>
            {loading ? "Resetting..." : "Reset Password"}
          </TTButton>
        </Form.Item>
      </Form>

      <div className="back-to-login-container">
        <TTButton ttVariant="transparent" onClick={onBackToLogin}>
          <ArrowLeftOutlined />
          Back to Login
        </TTButton>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
