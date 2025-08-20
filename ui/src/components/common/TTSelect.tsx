import React from 'react';
import { Select, SelectProps } from 'antd';

export type TTSelectProps = SelectProps & {
  width?: number | string;
};

/**
 * TTSelect: Wrapper around AntD Select with sensible Task Tango defaults.
 * - size: large
 * - width: 100%
 * Consumers can override any prop via rest.
 */
const TTSelect: React.FC<TTSelectProps> = ({ width = '100%', style, size = 'large', ...rest }) => {
  return <Select size={size} {...rest} style={{ width, ...(style || {}) }} />;
};

export default TTSelect;
