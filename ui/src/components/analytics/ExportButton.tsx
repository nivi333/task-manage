import React from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

interface ExportButtonProps {
  filename: string;
  data: unknown;
}

const ExportButton: React.FC<ExportButtonProps> = ({ filename, data }) => {
  const onExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button icon={<DownloadOutlined />} onClick={onExport}>
      Export JSON
    </Button>
  );
};

export default ExportButton;
