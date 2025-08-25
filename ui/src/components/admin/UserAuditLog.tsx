import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminService, AuditLogItem } from '../../services/adminService';
import dayjs from 'dayjs';

const UserAuditLog: React.FC = () => {
  const [data, setData] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const fetchData = async (p = page, s = pageSize) => {
    setLoading(true);
    try {
      const items = await adminService.getAuditLogs(p - 1, s);
      setData(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<AuditLogItem> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actor',
      dataIndex: 'actor',
      key: 'actor',
      render: (a) => a ? `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username : '—',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (u) => u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username : '—',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
  ];

  return (
    <Table
      rowKey={(r) => r.id}
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={{
        current: page,
        pageSize,
        onChange: (p, s) => {
          setPage(p);
          setPageSize(s);
          fetchData(p, s);
        },
      }}
    />
  );
};

export default UserAuditLog;
