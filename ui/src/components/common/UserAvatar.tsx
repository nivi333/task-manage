import React from "react";
import { Avatar, Tooltip } from "antd";
import { User } from "../../types/user";
import { getAvatarColor, getUserSeed } from "../../utils/avatarColor";

export interface UserAvatarProps {
  user?: Partial<User> | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  // Optional colored ring/border (e.g., deterministic color per user/task)
  ringColor?: string;
  // Whether to show tooltip with display name
  tooltip?: boolean;
  tooltipTitle?: string;
}

export const getUserDisplayName = (u?: Partial<User> | null): string => {
  const fn = u?.firstName?.trim() || "";
  const ln = u?.lastName?.trim() || "";
  const full = `${fn} ${ln}`.trim();
  return full || u?.username || "Unassigned";
};

const getInitial = (u?: Partial<User> | null): string => {
  if (!u) return "U";
  if (u.username) return u.username.charAt(0).toUpperCase();
  if (u.firstName) return u.firstName.charAt(0).toUpperCase();
  return "U";
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 28,
  className,
  style,
  tooltip = true,
  tooltipTitle,
}) => {
  const displayName = tooltipTitle || getUserDisplayName(user);
  const src = (user as any)?.profilePicture || (user as any)?.avatarUrl;
  const hasImage = Boolean(src);
  console.log('[UserAvatar] user:', user, 'profilePicture:', (user as any)?.profilePicture, 'avatarUrl:', (user as any)?.avatarUrl, 'src:', src, 'hasImage:', hasImage);
  const seed = getUserSeed(user);
  const bgColor = getAvatarColor(seed);

  const avatar = (
    <Avatar
      size={size}
      src={hasImage ? src : undefined}
      className={`tt-user-avatar ${hasImage ? "with-image" : "with-initial"} ${
        className || ""
      }`.trim()}
      data-size={size}
      style={{
        ...(style || {}),
        ...(!hasImage
          ? {
              backgroundColor: bgColor,
              color: "#fff",
            }
          : {}),
      }}
    >
      {!hasImage ? getInitial(user) : null}
    </Avatar>
  );

  return tooltip ? <Tooltip title={displayName}>{avatar}</Tooltip> : avatar;
};

export default UserAvatar;
