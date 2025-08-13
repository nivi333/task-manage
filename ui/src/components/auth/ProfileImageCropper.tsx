import React, { useRef, useState } from "react";
import { Modal, Button, Upload, message } from "antd";
import Cropper from "react-easy-crop";
import styled from "styled-components";
import { getCroppedImg } from "../../utils/cropImage";

const CropperContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  background: #f0f0f0;
`;

const AcceptedTypes = ["image/jpeg", "image/png", "image/jpg", "image/svg+xml"];
const MAX_SIZE = 1024 * 1024; // 1MB

interface ProfileImageCropperProps {
  visible: boolean;
  onOk: (file: File) => void;
  onCancel: () => void;
}

const ProfileImageCropper: React.FC<ProfileImageCropperProps> = ({ visible, onOk, onCancel }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileRef = useRef<File | null>(null);

  const beforeUpload = (file: File) => {
    if (!AcceptedTypes.includes(file.type)) {
      message.error("Only jpeg, jpg, png, svg files are allowed");
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_SIZE) {
      message.error("Image must not exceed 1 MB");
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    fileRef.current = file;
    return false;
  };

  const onCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels || !fileRef.current) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, fileRef.current.type);
    if (croppedBlob) {
      const croppedFile = new File([croppedBlob], fileRef.current.name, { type: fileRef.current.type });
      onOk(croppedFile);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    fileRef.current = null;
    onCancel();
  };

  return (
    <Modal open={visible} onCancel={handleCancel} onOk={handleCrop} okText="Crop & Save" title="Upload & Crop Profile Picture">
      {!imageSrc ? (
        <Upload
          accept=".jpg,.jpeg,.png,.svg"
          showUploadList={false}
          beforeUpload={beforeUpload}
          maxCount={1}
        >
          <Button type="primary" block>Choose Image</Button>
        </Upload>
      ) : (
        <>
          <CropperContainer>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </CropperContainer>
          <div style={{ marginTop: 16 }}>
            <span>Zoom: </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              style={{ width: 180 }}
            />
          </div>
        </>
      )}
    </Modal>
  );
};

export default ProfileImageCropper;
