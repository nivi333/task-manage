import React from 'react';
import { Table } from 'antd';
import './TTTable.css';
import type { TableProps } from 'antd';

export type TTTableProps<RecordType> = TableProps<RecordType> & {
  dense?: boolean;
};

function TTTable<RecordType extends object = any>({ dense = true, className, pagination, bordered, ...rest }: TTTableProps<RecordType>) {
  const mergedClass = [className, dense ? 'tt-table-dense' : undefined].filter(Boolean).join(' ');
  const defaultPagination = pagination === undefined
    ? {
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true,
      }
    : pagination;
  return (
    <Table<RecordType>
      size={dense ? 'middle' : 'large'}
      className={mergedClass}
      pagination={defaultPagination}
      bordered={bordered ?? true}
      {...rest}
    />
  );
}

export default TTTable;
