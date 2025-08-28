import React, { useEffect, useState } from "react";
import { Form, Input, Checkbox, message } from "antd";
import { TTButton } from "../common";
// All notifications will use Ant Design's message API at the top by default.
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { authAPI } from "../../services/authService";
import TwoFactorModal from "./TwoFactorModal";
import LoadingSpinner from "../common/LoadingSpinner";

interface LoginFormData {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [twoFactorVisible, setTwoFactorVisible] = useState(false);
  const [tempLoginData, setTempLoginData] = useState<any>(null);

  // Prefill remembered username and checkbox state
  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe") === "true";
    const rememberedUsername = localStorage.getItem("rememberedUsername") || "";
    if (remembered) {
      form.setFieldsValue({ rememberMe: true, usernameOrEmail: rememberedUsername });
    } else {
      form.setFieldsValue({ rememberMe: false });
    }
  }, [form]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): boolean => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);

    try {
      const response = await authAPI.login({
        usernameOrEmail: values.usernameOrEmail,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      // authAPI.login returns response.data already. Normalize shapes:
      const root: any = response; // could be { success, message, data } or direct payload
      const payload: any = root?.data ?? root;

      if (payload?.requires2FA) {
        setTempLoginData(payload);
        setTwoFactorVisible(true);
        console.log("[NOTIFICATION] LoginForm info");
        message.info("Please enter your 2FA code to complete login");
      } else {
        // Store auth tokens (support both flat and ApiResponse.data nested shapes)
        const token = payload?.token || payload?.accessToken;
        const refreshToken = payload?.refreshToken;
        if (token) {
          localStorage.setItem("authToken", token);
          // Expose helpers to inspect/copy token anytime
          (window as any).getAuthToken = () => localStorage.getItem("authToken");
          (window as any).copyAuthToken = async () => {
            const t = localStorage.getItem("authToken");
            if (!t) {
              console.warn("[Auth] No authToken in localStorage to copy.");
              return;
            }
            try {
              await navigator.clipboard.writeText(t);
              console.info("[Auth] authToken copied to clipboard.");
            } catch (err) {
              console.warn("[Auth] Clipboard write failed. Token:", t);
            }
          };
          console.info("[Auth] Logged in. authToken set:", token);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        // Remember Me: store only non-sensitive identifier, never password
        if (values.rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedUsername", values.usernameOrEmail || "");
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedUsername");
        }

        console.log("[NOTIFICATION] LoginForm success");
        message.success("Login successful!");
        // Decode roles from JWT if present and pass to caller
        let roles: string[] = [];
        try {
          if (token) {
            const payloadStr = atob(token.split(".")[1] || "");
            const jwtPayload = JSON.parse(payloadStr);
            roles = Array.isArray(jwtPayload?.roles) ? jwtPayload.roles : [];
          }
        } catch (e) {
          // ignore decoding errors
        }
        onLoginSuccess({ roles });
      }
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        console.log("[NOTIFICATION] LoginForm error");
        message.error(
          "Invalid credentials. Please check your username/email and password."
        );
      } else if (error.response?.status === 423) {
        console.log("[NOTIFICATION] LoginForm error");
        message.error(
          "Account is locked. Please contact support or try again later."
        );
      } else {
        console.log("[NOTIFICATION] LoginForm error");
        message.error(error.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = async (twoFactorCode: string) => {
    setLoading(true);

    try {
      const response = await authAPI.verify2FA({
        tempToken: tempLoginData?.tempToken || "",
        code: twoFactorCode,
      });

      // authAPI.verify2FA also returns response.data. Normalize and extract tokens
      const root: any = response;
      const payload: any = root?.data ?? root;
      const accessToken = payload?.accessToken || payload?.token;
      const refreshToken = payload?.refreshToken;
      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
        (window as any).getAuthToken = () => localStorage.getItem("authToken");
        (window as any).copyAuthToken = async () => {
          const t = localStorage.getItem("authToken");
          if (!t) {
            console.warn("[Auth] No authToken in localStorage to copy.");
            return;
          }
          try {
            await navigator.clipboard.writeText(t);
            console.info("[Auth] authToken copied to clipboard.");
          } catch (err) {
            console.warn("[Auth] Clipboard write failed. Token:", t);
          }
        };
        console.info("[Auth] 2FA success. authToken set:", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      console.log("[NOTIFICATION] LoginForm success");
      message.success("2FA verification successful!");
      // Pass roles decoded from token if possible
      let roles: string[] = [];
      try {
        if (accessToken) {
          const payloadStr = atob(accessToken.split(".")[1] || "");
          const jwtPayload = JSON.parse(payloadStr);
          roles = Array.isArray(jwtPayload?.roles) ? jwtPayload.roles : [];
        }
      } catch (e) {}
      onLoginSuccess({ roles });
      setTwoFactorVisible(false);
    } catch (error: any) {
      console.error("2FA verification error:", error);
      console.log("[NOTIFICATION] LoginForm error");
      message.error("Invalid 2FA code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    console.log("[NOTIFICATION] LoginForm info");
    message.info(`${provider} login will be implemented soon`);
    // TODO: Implement OAuth2 flow
    // window.location.href = `/api/v1/oauth2/authorize/${provider}`;
  };

  return (
    <>
      <div className="auth-card tt-card-flat">
        <h1 className="auth-title">Login</h1>

        <Form
          form={form}
          name="login"
          onFinish={(values) => handleLogin(values as LoginFormData)}
          autoComplete="on"
          size="large"
          className="auth-form"
        >
          <Form.Item
            name="usernameOrEmail"
            rules={[
              {
                required: true,
                message: "Please input your username or email!",
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();

                  const isEmail = value.includes("@");
                  if (isEmail && !validateEmail(value)) {
                    return Promise.reject(
                      new Error("Please enter a valid email address!")
                    );
                  }
                  if (!isEmail && !validateUsername(value)) {
                    return Promise.reject(
                      new Error(
                        "Username must be at least 3 characters and contain only letters, numbers, and underscores!"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username or Email"
              autoComplete="username"
              name="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
              name="current-password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <div className="remember-me-container">
            <Form.Item name="rememberMe" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a className="link-primary" href="/forgot-password">
              Forgot password?
            </a>
          </div>

          <Form.Item>
            <TTButton ttVariant="primary" htmlType="submit" loading={loading} block>
              {loading ? "Signing in..." : "Sign In"}
            </TTButton>
          </Form.Item>
        </Form>

        <div className="back-to-login-container">
          Don't have an account? <a className="link-primary" href="/register">Sign up</a>
        </div>
      </div>

      {/* 2FA Modal */}
      <TwoFactorModal
        visible={twoFactorVisible}
        onSuccess={handle2FASuccess}
        onCancel={() => setTwoFactorVisible(false)}
        loading={loading}
      />

      {/* Global Loading Spinner */}
      {loading && <LoadingSpinner />}
    </>
  );
};

export default LoginForm;
