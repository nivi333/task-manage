import React from 'react';

type Props = {
  subtasks: any[];
  parentTaskId: string;
  compact?: boolean;
};

const SubtaskManagement: React.FC<Props> = ({ subtasks, parentTaskId, compact }) => {
  // TODO: Render and manage subtasks
  if (compact) {
    return <div style={{ margin: 0 }}>Subtasks (Coming soon)</div>;
  }
  return <div style={{ marginTop: 24 }}><b>Subtasks</b> (Coming soon)</div>;
};
export default SubtaskManagement;
