import React from 'react';
import { Select, SelectProps } from 'antd';

export type TTSelectProps = SelectProps & {
  width?: number | string;
};

const TTSelect: React.FC<TTSelectProps> = ({ width = 160, style, ...rest }) => {
  return <Select {...rest} style={{ width, ...(style || {}) }} />;
};

export default TTSelect;
