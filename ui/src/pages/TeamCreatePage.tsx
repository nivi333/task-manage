import React from 'react';
import TeamForm from '../components/team/TeamForm';

// Team creation form for modal usage
const TeamCreateForm: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({ onSuccess, onCancel }) => {
  return (
    <TeamForm />
  );
};

export default TeamCreateForm;
