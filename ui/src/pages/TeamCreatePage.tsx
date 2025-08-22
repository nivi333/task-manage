import React from 'react';
import TeamForm from '../components/team/TeamForm';
import { Team } from '../types/team';

// Team creation form for modal usage
const TeamCreateForm: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({ onSuccess, onCancel }) => {
  return (
    <TeamForm
      onCancel={onCancel}
      onSuccess={(_team: Team) => {
        onSuccess();
      }}
    />
  );
};

export default TeamCreateForm;
