import React from 'react';
import { DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';

export type TTDateRangePickerProps = RangePickerProps;

const TTDateRangePicker: React.FC<TTDateRangePickerProps> = (props) => {
  const { RangePicker } = DatePicker;
  return <RangePicker {...props} />;
};

export default TTDateRangePicker;
