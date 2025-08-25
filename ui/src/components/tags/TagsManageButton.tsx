import React, { useState } from "react";
import { Button, ButtonProps } from "antd";
import { TagsOutlined } from "@ant-design/icons";
import TagsManageModal from "./TagsManageModal";
import tagsService from "services/tagsService";

interface TagsManageButtonProps {
  label?: string;
  buttonProps?: ButtonProps;
}

const TagsManageButton: React.FC<TagsManageButtonProps> = ({ label = "Manage Tags", buttonProps }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon={<TagsOutlined />} onClick={() => setOpen(true)} {...buttonProps}>{label}</Button>
      <TagsManageModal
        open={open}
        onClose={() => setOpen(false)}
        onChanged={() => {
          // Ensure consumers get fresh names after changes
          tagsService.invalidateCache();
        }}
      />
    </>
  );
};

export default TagsManageButton;
