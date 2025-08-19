import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Form,
  Input,
  Button,
  Space,
  Upload,
  Avatar,
  Typography,
  Divider,
  Modal,
  Slider,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  QrcodeOutlined,
  SaveOutlined,
  LockOutlined,
  UserOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { userService } from "../services/userService";
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfile,
  TwoFAEnableResponse,
} from "../types/user";
import AppLayout from "../components/layout/AppLayout";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

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
  const [qrModal, setQrModal] = useState<{
    open: boolean;
    data?: TwoFAEnableResponse;
  }>({ open: false });

  const [form] = Form.useForm<UpdateProfileRequest>();
  const [pwdForm] = Form.useForm<ChangePasswordRequest>();
  const navigate = useNavigate();
  const [profileImageList, setProfileImageList] = useState<UploadFile[]>([]);
  const [profileImageMeta, setProfileImageMeta] = useState<{
    size: number;
    type: string;
  } | null>(null);
  // Cropper state (no external deps)
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffset, setCropOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = React.useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

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
      // Initialize Upload preview from existing profile picture
      if (data.profilePicture) {
        setProfileImageList([
          {
            uid: "-1",
            name: "profile-image",
            status: "done",
            url: data.profilePicture,
          } as UploadFile,
        ]);
      } else {
        setProfileImageList([]);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const msg: string | undefined = e?.response?.data?.message || e?.message;
      // Redirect to login if unauthorized or backend signals missing auth principal
      if (
        status === 401 ||
        (status === 500 && msg && msg.toLowerCase().includes("user is null"))
      ) {
        navigate("/login");
        return;
      }
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
    <AppLayout title="My Profile" contentPadding={24}>
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card
                title={
                  <Space>
                    <UserOutlined />
                    <Text strong>Profile Information</Text>
                  </Space>
                }
                loading={loading}
              >
                <Space align="start" size={16} style={{ width: "100%" }}>
                  <div style={{ position: "relative" }}>
                    <Upload
                      className="avatar-upload"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        const isValidType = [
                          "image/png",
                          "image/jpeg",
                          "image/jpg",
                          "image/svg+xml",
                        ].includes(file.type);
                        const isLt1M = (file.size ?? 0) <= 1 * 1024 * 1024;
                        if (!isValidType || !isLt1M) {
                          const errors = [] as string[];
                          if (!isValidType)
                            errors.push(
                              "Only JPG, JPEG, PNG, or SVG files are allowed."
                            );
                          if (!isLt1M)
                            errors.push("Image must be smaller than 1MB.");
                          setProfileImageMeta({
                            size: file.size ?? 0,
                            type: file.type,
                          });
                          setProfileImageList([]);
                          // Clear any previous inline errors & show only toast notification
                          form.setFields([{ name: "profilePicture", errors: [] }]);
                          message.error(errors.join(" "));
                          return Upload.LIST_IGNORE;
                        }
                        const b64 = await getBase64(file as File);
                        // open cropper modal instead of setting directly
                        setCropSrc(b64);
                        setCropScale(1);
                        setCropOffset({ x: 0, y: 0 });
                        setCropModalOpen(true);
                        setProfileImageMeta({
                          size: file.size ?? 0,
                          type: file.type,
                        });
                        return Upload.LIST_IGNORE;
                      }}
                    >
                      <div style={{ cursor: "pointer" }}>
                        <Avatar
                          size={96}
                          src={
                            form.getFieldValue("profilePicture") ||
                            profile?.profilePicture
                          }
                          icon={<UserOutlined />}
                        />
                      </div>
                    </Upload>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>
                        <div>Only JPG, JPEG, PNG, SVG.</div>
                        <div>Max size 1MB.</div>
                      </div>
                    </div>
                    {(form.getFieldValue("profilePicture") ||
                      profileImageList.length > 0 ||
                      profile?.profilePicture) && (
                      <Button
                        size="small"
                        type="text"
                        icon={
                          <CloseCircleFilled style={{ color: "#ff4d4f" }} />
                        }
                        onClick={() => {
                          form.setFieldsValue({
                            profilePicture: undefined as any,
                          });
                          setProfileImageList([]);
                          setProfileImageMeta(null);
                          form.setFields([
                            { name: "profilePicture", errors: [] },
                          ]);
                        }}
                        style={{ position: "absolute", top: -8, right: -8 }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={onSaveProfile}
                    >
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[
                              {
                                required: true,
                                message: "First name is required",
                              },
                            ]}
                          >
                            <Input placeholder="First name" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[
                              {
                                required: true,
                                message: "Last name is required",
                              },
                            ]}
                          >
                            <Input placeholder="Last name" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                              {
                                required: true,
                                type: "email",
                                message: "Valid email required",
                              },
                            ]}
                          >
                            <Input placeholder="email@example.com" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="username"
                            label="Username"
                            rules={[
                              {
                                required: true,
                                message: "Username is required",
                              },
                            ]}
                          >
                            <Input placeholder="username" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name="profilePicture"
                        hidden
                        rules={[
                          () => ({
                            validator: async () => {
                              // If nothing selected, no validation error (optional field)
                              const val = form.getFieldValue("profilePicture");
                              if (!val) return Promise.resolve();
                              // If meta is present, enforce constraints
                              if (profileImageMeta) {
                                const allowed = [
                                  "image/png",
                                  "image/jpeg",
                                  "image/jpg",
                                  "image/svg+xml",
                                ];
                                if (!allowed.includes(profileImageMeta.type)) {
                                  return Promise.reject(
                                    new Error(
                                      "Only JPG, JPEG, PNG, or SVG files are allowed."
                                    )
                                  );
                                }
                                if (profileImageMeta.size > 1 * 1024 * 1024) {
                                  return Promise.reject(
                                    new Error("Image must be smaller than 1MB.")
                                  );
                                }
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <Input type="hidden" />
                      </Form.Item>

                      <Form.Item>
                        <Space>
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                          >
                            Save Changes
                          </Button>
                          <Button
                            htmlType="button"
                            onClick={() => form.resetFields()}
                          >
                            Reset
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card
                title={
                  <Space>
                    <LockOutlined />
                    <Text strong>Change Password</Text>
                  </Space>
                }
              >
                <Form
                  form={pwdForm}
                  layout="vertical"
                  onFinish={onChangePassword}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[
                      {
                        required: true,
                        message: "Current password is required",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Current password" />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      { required: true, message: "New password is required" },
                      { min: 8, message: "Must be at least 8 characters" },
                    ]}
                  >
                    <Input.Password placeholder="New password" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={["newPassword"]}
                    rules={[
                      {
                        required: true,
                        message: "Please confirm new password",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("newPassword") === value)
                            return Promise.resolve();
                          return Promise.reject(
                            new Error("Passwords do not match")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Confirm password" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Update Password
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <Divider />

              <Card
                title={
                  <Space>
                    <QrcodeOutlined />
                    <Text strong>Two-Factor Authentication</Text>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text>Secure your account by enabling 2FA.</Text>
                  <Button onClick={onEnable2FA} icon={<QrcodeOutlined />}>
                    Enable 2FA
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>

        <Modal
          destroyOnClose
          title="Scan this QR to complete 2FA setup"
          open={qrModal.open}
          onCancel={() => setQrModal({ open: false })}
          footer={
            <Button onClick={() => setQrModal({ open: false })}>Close</Button>
          }
        >
          {qrModal.data?.qrImageUrl ? (
            <div style={{ textAlign: "center" }}>
              <img
                src={qrModal.data.qrImageUrl}
                alt="2FA QR"
                style={{ maxWidth: "100%" }}
              />
              {qrModal.data.secretKey && (
                <Text type="secondary">Secret: {qrModal.data.secretKey}</Text>
              )}
            </div>
          ) : (
            <Space direction="vertical">
              {qrModal.data?.secretKey && (
                <Text strong>Secret Key: {qrModal.data.secretKey}</Text>
              )}
              <Text>{qrModal.data?.message || "2FA is now enabled."}</Text>
            </Space>
          )}
        </Modal>

        {/* Crop Image Modal */}
        <Modal
          title="Crop Image"
          open={cropModalOpen}
          onCancel={() => setCropModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setCropModalOpen(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={async () => {
                if (!cropSrc) return;
                // Render to canvas 256x256 using current scale/offset
                const img = new Image();
                img.src = cropSrc;
                await new Promise((res) => {
                  img.onload = () => res(null);
                });
                const size = 256;
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d")!;
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, size, size);
                const drawW = img.width * cropScale;
                const drawH = img.height * cropScale;
                const dx = cropOffset.x + (size - drawW) / 2;
                const dy = cropOffset.y + (size - drawH) / 2;
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, dx, dy, drawW, drawH);
                const b64 = canvas.toDataURL("image/png");
                form.setFieldsValue({ profilePicture: b64 });
                setProfileImageList([
                  {
                    uid: "cropped",
                    name: "profile.png",
                    status: "done",
                    url: b64,
                  },
                ]);
                form.setFields([{ name: "profilePicture", errors: [] }]);
                setCropModalOpen(false);
              }}
            >
              Save
            </Button>,
          ]}
        >
          {cropSrc && (
            <div>
              <div
                className="cropper-frame"
                onMouseDown={(e) => {
                  setIsDragging(true);
                  dragRef.current = {
                    startX: e.clientX,
                    startY: e.clientY,
                    initX: cropOffset.x,
                    initY: cropOffset.y,
                  };
                }}
                onMouseMove={(e) => {
                  if (!isDragging || !dragRef.current) return;
                  const dx = e.clientX - dragRef.current.startX;
                  const dy = e.clientY - dragRef.current.startY;
                  setCropOffset({
                    x: dragRef.current.initX + dx,
                    y: dragRef.current.initY + dy,
                  });
                }}
                onMouseUp={() => {
                  setIsDragging(false);
                  dragRef.current = null;
                }}
                onMouseLeave={() => {
                  setIsDragging(false);
                  dragRef.current = null;
                }}
              >
                <img
                  ref={imgRef}
                  src={cropSrc}
                  alt="crop"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px)) scale(${cropScale})`,
                    transformOrigin: "center center",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <Text strong>Zoom</Text>
                <Slider
                  min={1}
                  max={3}
                  step={0.01}
                  value={cropScale}
                  onChange={(v) => setCropScale(v)}
                />
              </div>
            </div>
          )}
        </Modal>
    </AppLayout>
  );
};

export default UserProfilePage;
