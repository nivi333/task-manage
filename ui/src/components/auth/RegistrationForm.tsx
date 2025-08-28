import React, { useState } from "react";
import { Form, Input, Checkbox, message, Upload, Avatar } from "antd";
import { TTButton } from "../common";
import styled from "styled-components";
import RegistrationStepper from "./RegistrationStepper";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
// Removed cropper modal per UX request; using simple inline Upload + Avatar preview

import { authAPI, RegisterRequest } from "../../services/authService";
import LoadingSpinner from "../common/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const StyledForm = styled(Form)`
  .ant-form-item-explain-error {
    text-align: left !important;
    justify-content: flex-start !important;
    margin-left: 0 !important;
  }
`;

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
  color: var(--color-text-primary);
  font-size: 28px;
  font-weight: 600;
`;

// Terms modal removed per UX: acceptance handled by inline checkbox only

const steps = ["Personal Info", "Account Setup", "Verification"];

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // Terms modal removed; keep only form field value
  const [currentStep, setCurrentStep] = useState(0);
  const [passwordValue, setPasswordValue] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const beforeUploadAvatar = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      message.error("Only jpeg, jpg, png, svg files are allowed");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 1024 * 1024) {
      message.error("Image must not exceed 1 MB");
      return Upload.LIST_IGNORE;
    }
    setProfileImage(file);
    setProfileImageUrl(URL.createObjectURL(file));
    return false; // prevent auto upload
  };

  const handleFinish = async (_values: any) => {
    // Always read all values from the form store, including unmounted fields across steps
    const values = form.getFieldsValue(true);
    console.log("Submitting registration with values:", values);
    if (!values.acceptTerms) {
      console.log("[NOTIFICATION] RegistrationForm error");
      console.log("[NOTIFICATION] RegistrationForm info");
      message.info("You must accept the terms and conditions.");
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
      if (profileImage) {
        // If your backend accepts image as base64 or multipart, update accordingly
        req.profileImage = profileImage;
      }
      console.log("Calling register API with payload:", req);
      const resp = await authAPI.register(req);
      console.log("Register API response:", resp);
      console.log("[NOTIFICATION] RegistrationForm success");
      console.log("[NOTIFICATION] RegistrationForm info");
      message.success("Registration successful!");
      // Move to completion step only after successful submission
      setCurrentStep(2);
      form.resetFields();
    } catch (err: any) {
      console.log("[NOTIFICATION] RegistrationForm error");
      console.log("[NOTIFICATION] RegistrationForm info");
      message.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Terms checkbox handled inline; no modal

  return (
    <RegistrationCard className="auth-card tt-card-flat">
      <RegistrationTitle>Register</RegistrationTitle>
      <RegistrationStepper current={currentStep} />
      <StyledForm
        className="auth-form"
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onFinishFailed={({ errorFields }) => {
          if (errorFields && errorFields.length > 0) {
            console.log("[NOTIFICATION] RegistrationForm error");
            console.log("[NOTIFICATION] RegistrationForm info");
            message.error(
              errorFields[0].errors?.[0] || "Please fix validation errors"
            );
          }
        }}
        preserve
        autoComplete="on"
        initialValues={{ acceptTerms: false }}
      >
        {currentStep === 0 && (
          <>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="First Name"
                autoComplete="given-name"
                name="given-name"
              />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Last Name"
                autoComplete="family-name"
                name="family-name"
              />
            </Form.Item>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Username is required" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                autoComplete="username"
                name="username"
              />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                autoComplete="email"
                name="email"
              />
            </Form.Item>
            <Form.Item>
              <TTButton
                ttVariant="primary"
                block
                onClick={async () => {
                  try {
                    await form.validateFields([
                      "firstName",
                      "lastName",
                      "username",
                      "email",
                    ]);
                    setCurrentStep(1);
                  } catch {}
                }}
              >
                Next
              </TTButton>
            </Form.Item>
          </>
        )}
        {currentStep === 1 && (
          <>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Password is required",
                },
                {
                  min: 8,
                  message: "Password must be at least 8 characters",
                },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Password must contain upper and lower case letters, a digit, and a special character",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                onChange={(e) => setPasswordValue(e.target.value)}
                autoComplete="new-password"
                name="new-password"
              />
            </Form.Item>
            <PasswordStrengthMeter password={passwordValue} />
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
                autoComplete="new-password"
                name="confirm-new-password"
              />
            </Form.Item>
            <Form.Item label="Profile Picture (optional)">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar
                  src={profileImageUrl || undefined}
                  style={{ backgroundColor: "#ececec" }}
                  size={64}
                >
                  {!profileImageUrl &&
                    (form.getFieldValue("firstName")?.[0] ||
                      form.getFieldValue("username")?.[0] ||
                      "U")}
                </Avatar>
                <Upload
                  accept=".jpg,.jpeg,.png,.svg"
                  showUploadList={false}
                  beforeUpload={beforeUploadAvatar}
                  maxCount={1}
                >
                  <TTButton icon={<UploadOutlined />}>Upload Image</TTButton>
                </Upload>
              </div>
            </Form.Item>
            <Form.Item
              name="acceptTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          "You must accept the terms and conditions"
                        ),
                },
              ]}
            >
              <Checkbox>
                I accept the{" "}
                <a
                  href="/terms"
                  className="link-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  terms and conditions
                </a>
              </Checkbox>
            </Form.Item>
            <Form.Item>
              <TTButton
                ttVariant="primary"
                block
                onClick={async () => {
                  try {
                    await form.validateFields([
                      "password",
                      "confirmPassword",
                      "acceptTerms",
                    ]);
                    // Submit before changing steps to avoid unmounting fields and losing values
                    form.submit();
                  } catch {}
                }}
              >
                Register
              </TTButton>
            </Form.Item>
            <Form.Item>
              <TTButton
                ttVariant="secondary"
                block
                onClick={() => setCurrentStep(0)}
              >
                Back
              </TTButton>
            </Form.Item>
          </>
        )}
        {currentStep === 2 && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <h3>Registration Complete!</h3>
            <p>Check your email for verification instructions.</p>
          </div>
        )}
        <Form.Item>
          <TTButton
            ttVariant="transparent"
            block
            onClick={() => navigate("/login")}
          >
            <ArrowLeftOutlined /> Back to Login
          </TTButton>
        </Form.Item>
      </StyledForm>

      {/* Auth footer link for parity with Login page */}
      <div className="back-to-login-container">
        Already have an account?{" "}
        <a className="link-primary" href="/login">
          Sign in
        </a>
      </div>
      {/* Terms modal removed */}
    </RegistrationCard>
  );
};

export default RegistrationForm;
