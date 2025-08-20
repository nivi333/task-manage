import React, { useState, useEffect } from "react";
import { Result } from "antd";
import { CheckCircleOutlined, MailOutlined } from "@ant-design/icons";
import { TTButton } from "../common";

interface SuccessMessageProps {
  type: "forgot-password" | "reset-password";
  email?: string;
  onBackToLogin: () => void;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  type,
  email,
  onBackToLogin,
  autoRedirect = true,
  redirectDelay = 5,
}) => {
  const [countdown, setCountdown] = useState(redirectDelay);

  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onBackToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, onBackToLogin]);

  const getContent = () => {
    if (type === "forgot-password") {
      return {
        icon: <MailOutlined style={{ color: "#667eea" }} />,
        title: "Check Your Email",
        subtitle: email
          ? `We've sent password reset instructions to ${email}. Please check your inbox and follow the link to reset your password.`
          : "We've sent password reset instructions to your email. Please check your inbox and follow the link to reset your password.",
        extra: (
          <div>
            <TTButton ttVariant="primary" onClick={onBackToLogin}>
              Back to Login
            </TTButton>
            {autoRedirect && countdown > 0 && (
              <p className="countdown-text">
                Redirecting to login in {countdown} seconds...
              </p>
            )}
          </div>
        ),
      };
    } else {
      return {
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        title: "Password Reset Successful",
        subtitle:
          "Your password has been successfully reset. You can now log in with your new password.",
        extra: (
          <div>
            <TTButton ttVariant="primary" onClick={onBackToLogin}>
              Continue to Login
            </TTButton>
            {autoRedirect && countdown > 0 && (
              <p className="countdown-text">
                Redirecting to login in {countdown} seconds...
              </p>
            )}
          </div>
        ),
      };
    }
  };

  const content = getContent();

  return (
    <div className="auth-card success-card">
      <Result
        icon={content.icon}
        title={content.title}
        subTitle={content.subtitle}
        extra={content.extra}
      />
    </div>
  );
};

export default SuccessMessage;
