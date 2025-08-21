import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import { User } from '../../types/user';
import { userService } from '../../services/userService';

interface UserSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ value, onChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    userService.getUsers()
      .then(res => setUsers(res.users))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Select
      showSearch
      placeholder="Select assignee"
      optionFilterProp="children"
      value={value}
      onChange={onChange}
      loading={loading}
      allowClear
      filterOption={(input, option) =>
        String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
      }
      style={{ width: '100%' }}
    >
      {users.map(user => (
        <Select.Option key={user.id} value={user.id}>
          {user.firstName} {user.lastName} ({user.username})
        </Select.Option>
      ))}
    </Select>
  );
};

export default UserSelector;
