import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';

export type TTTableProps<RecordType> = TableProps<RecordType> & {
  dense?: boolean;
};

function TTTable<RecordType extends object = any>({ dense = true, className, ...rest }: TTTableProps<RecordType>) {
  const mergedClass = [className, dense ? 'tt-table-dense' : undefined].filter(Boolean).join(' ');
  return <Table<RecordType> size={dense ? 'middle' : 'large'} className={mergedClass} pagination={false} {...rest} />;
}

export default TTTable;
