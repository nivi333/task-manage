import React from 'react';

type Props = { attachments: any[]; compact?: boolean };

const FileAttachmentViewer: React.FC<Props> = ({ attachments, compact }) => {
  // TODO: Render file attachments
  if (compact) {
    return <div style={{ margin: 0 }}>Attachments (Coming soon)</div>;
  }
  return <div style={{ marginTop: 24 }}><b>Attachments</b> (Coming soon)</div>;
};
export default FileAttachmentViewer;
