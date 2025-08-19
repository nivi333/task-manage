import React from "react";
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import styled from "styled-components";

interface ButtonProps
  extends Omit<AntButtonProps, "type" | "size" | "variant"> {
  variant?: "primary" | "secondary" | "transparent";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const StyledButton = styled(AntButton)<{ $variant: string; $size: string }>`
  &.ant-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--font-family-primary);
    font-weight: var(--font-weight-medium);
    border-radius: var(--border-radius-md);
    transition: all 0.2s ease-in-out;
    box-shadow: none;

    /* Size variants */
    ${(props) =>
      props.$size === "sm" &&
      `
      padding: 4px 8px;
      font-size: var(--font-size-sm);
      height: 32px;
    `}

    ${(props) =>
      props.$size === "md" &&
      `
      padding: 8px 16px;
      font-size: var(--font-size-md);
      height: 40px;
    `}
    
    ${(props) =>
      props.$size === "lg" &&
      `
      padding: 12px 24px;
      font-size: var(--font-size-lg);
      height: 48px;
    `}
    
    /* Primary variant - Gradient */
    ${props => props.$variant === 'primary' && `
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%) !important;
      border: none !important;
      color: white;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%) !important;
        color: white !important;
        box-shadow: var(--shadow-md) !important;
        transform: translateY(-1px) !important;
        transition: all 0.2s ease !important;
        filter: brightness(1.1) !important;
      }
      
      &:focus:not(:disabled) {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%) !important;
        color: white !important;
        box-shadow: var(--shadow-md) !important;
        transform: translateY(-1px) !important;
        transition: all 0.2s ease !important;
        filter: brightness(1.1) !important;
      }
      
      &:active:not(:disabled) {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%) !important;
        color: white !important;
        transform: translateY(0px) !important;
        box-shadow: var(--shadow-sm) !important;
        filter: brightness(0.9) !important;
      }
    `}
    
    /* Secondary variant */
    ${(props) =>
      props.$variant === "secondary" &&
      `
      background-color: transparent;
      border-color: var(--color-primary);
      color: var(--color-primary);
      
      &:hover:not(:disabled) {
        background-color: var(--color-primary) !important;
        border-color: var(--color-primary) !important;
        color: white !important;
      }
      
      &:focus:not(:disabled) {
        background-color: var(--color-primary) !important;
        border-color: var(--color-primary) !important;
        color: white !important;
      }
      
      &:active:not(:disabled) {
        background-color: var(--color-secondary) !important;
        border-color: var(--color-secondary) !important;
        color: white !important;
      }
    `}
    
    /* Transparent variant */
    ${(props) =>
      props.$variant === "transparent" &&
      `
      background: transparent !important;
      background-color: transparent !important;
      border: 1px solid transparent !important;
      border-color: transparent !important;
      color: #667eea !important;
      box-shadow: none !important;
      font-size: 14px !important;
      height: auto !important;
      padding: 8px 16px !important;
      
      &:hover:not(:disabled) {
        background: transparent !important;
        background-color: transparent !important;
        border: 1px solid #667eea !important;
        border-color: #667eea !important;
        color: #667eea !important;
        box-shadow: none !important;
        transform: none !important;
      }
      
      &:focus:not(:disabled) {
        background: transparent !important;
        background-color: transparent !important;
        border: 1px solid #667eea !important;
        border-color: #667eea !important;
        color: #667eea !important;
        box-shadow: none !important;
        transform: none !important;
      }
      
      &:active:not(:disabled) {
        background: transparent !important;
        background-color: transparent !important;
        border: 1px solid #667eea !important;
        border-color: #667eea !important;
        color: #667eea !important;
        box-shadow: none !important;
        transform: none !important;
      }
    `}
  }
`;

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "sm",
  children,
  ...props
}) => {
  // Only set AntD type for primary/secondary
  let antType: any = undefined;
  if (variant === "primary") antType = "primary";
  if (variant === "secondary") antType = "default";

  return (
    <StyledButton $variant={variant} $size={size} type={antType} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button;
