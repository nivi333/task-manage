import React from 'react';
import { Button, ButtonProps } from 'antd';

export type TTButtonVariant = 'primary' | 'secondary' | 'transparent';
export type TTButtonSize = 'sm' | 'md' | 'lg';

export type TTButtonProps = ButtonProps & {
  ttVariant?: TTButtonVariant;
  ttSize?: TTButtonSize;
  // Allow custom design-system props without TS errors in consumers
  [key: string]: any;
};

const TTButton: React.FC<TTButtonProps> = ({
  ttVariant,
  ttSize,
  className,
  children,
  ...rest
}) => {
  const classes: string[] = ['btn-base'];

  if (ttVariant) {
    if (ttVariant === 'primary') classes.push('btn-primary');
    if (ttVariant === 'secondary') classes.push('btn-secondary');
    // Remove 'btn-transparent' from classes; let .ant-btn handle transparent style
  }

  if (ttSize) {
    if (ttSize === 'sm') classes.push('btn-sm');
    if (ttSize === 'md') classes.push('btn-md');
    if (ttSize === 'lg') classes.push('btn-lg');
  }

  if (rest.block) {
    classes.push('btn-block');
  }

  const mergedClassName = [className, ...classes].filter(Boolean).join(' ');

  return (
    <Button {...rest} className={mergedClassName}>
      {children}
    </Button>
  );
};

export default TTButton;
