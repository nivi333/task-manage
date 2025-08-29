import React from 'react';
import { render } from '@testing-library/react';

import ProjectsListPage from './ProjectsListPage';
import { projectService } from '../services/projectService';

// Mock AppLayout to avoid router hooks from inside the layout
jest.mock('../components/layout/AppLayout', () => ({ __esModule: true, default: ({ children }: any) => <div data-testid="layout">{children}</div> }));

// Mock react-router-dom Link only (no need for MemoryRouter)
jest.mock('react-router-dom', () => ({
  __esModule: true,
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}), { virtual: true });

// Mock Ant Design to avoid responsive hooks and heavy internals
jest.mock('antd', () => {
  const React = require('react');
  const Card = ({ children }: any) => <div data-testid="card">{children}</div>;
  const Space = ({ children }: any) => <div data-testid="space">{children}</div>;
  const Input = ({ value, onChange, placeholder }: any) => (
    <input placeholder={placeholder} value={value} onChange={onChange} />
  );
  const Empty = ({ description }: any) => <div>{description || 'Empty'}</div>;
  const Skeleton = () => <div>Loading...</div>;
  const Tag = ({ children }: any) => <span>[{children}]</span>;
  const Avatar = () => <span>Avatar</span>;
  const Typography = {
    Title: ({ level, children, style }: any) => <h4 style={style} data-level={level}>{children}</h4>,
    Text: ({ children, type }: any) => <span data-type={type}>{children}</span>,
  } as any;
  const Tooltip = ({ children }: any) => <>{children}</>;
  const List = ({ dataSource, renderItem }: any) => (
    <ul>
      {Array.isArray(dataSource) ? dataSource.map((item: any, idx: number) => (
        <li key={idx}>{renderItem(item)}</li>
      )) : null}
    </ul>
  );
  const Checkbox = ({ checked, onChange }: any) => (
    <input type="checkbox" checked={checked} onChange={onChange} />
  );
  const Progress = ({ percent }: any) => <div data-testid="progress">{percent}%</div>;
  const Row = ({ children }: any) => <div data-testid="row">{children}</div>;
  const Col = ({ children }: any) => <div data-testid="col">{children}</div>;
  const Popconfirm = ({ children, onConfirm }: any) => (
    <span onClick={onConfirm} data-testid="popconfirm">{children}</span>
  );
  const Button = ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  );
  const Select = ({ options = [], onChange, value, placeholder }: any) => (
    <select data-testid="select" onChange={(e: any) => onChange?.(e.target.value)} value={value}>
      <option value="" hidden>{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
  const Table = ({ dataSource = [], columns = [] }: any) => (
    <div data-testid="table">
      {dataSource.map((record: any, idx: number) => (
        <div key={idx} data-testid="table-row">
          {columns.map((col: any, cidx: number) => {
            const text = col.dataIndex ? record[col.dataIndex] : undefined;
            const node = col.render ? col.render(text, record) : text;
            return <span key={col.key || col.dataIndex || cidx}>{node}</span>;
          })}
        </div>
      ))}
    </div>
  );
  // Minimal DatePicker mock with RangePicker to satisfy destructuring
  const DatePicker: any = ({ onChange }: any) => (
    <input data-testid="datepicker" onChange={onChange} />
  );
  DatePicker.RangePicker = ({ onChange }: any) => (
    <input data-testid="range-picker" onChange={onChange} />
  );
  return { Card, Space, Input, Empty, Skeleton, Tag, Avatar, Typography, Tooltip, List, Checkbox, Progress, Row, Col, Popconfirm, DatePicker, Button, Select, Table };
});

jest.mock('../services/projectService', () => ({
  __esModule: true,
  projectService: {
    list: jest.fn(),
  },
}));

jest.mock('../services/teamService', () => ({
  __esModule: true,
  teamService: {
    list: jest.fn().mockResolvedValue([]),
  },
}));

// Stub modals to avoid importing heavy AntD form internals
jest.mock('../components/projects/CreateProjectModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../components/projects/EditProjectModal', () => ({
  __esModule: true,
  default: () => null,
}));

describe('ProjectsListPage', () => {
  it('renders and lists projects with dashboard links', async () => {
    (projectService.list as unknown as jest.Mock).mockResolvedValue([
      { id: '11111111-1111-1111-1111-111111111111', name: 'Alpha Project', key: 'ALPHA', status: 'ACTIVE', description: 'First project' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Beta Project', key: 'BETA', status: 'ON_HOLD', description: 'Second project' },
    ]);
    const { getByText, getAllByText, findByText } = render(<ProjectsListPage />);

    // Title
    expect(getByText('All Projects')).toBeInTheDocument();

    // Wait for list items via async queries
    expect(await findByText('Alpha Project')).toBeInTheDocument();
    expect(await findByText('Beta Project')).toBeInTheDocument();

    // Projects and keys appear in table view
    expect(getByText('ALPHA')).toBeInTheDocument();
    expect(getByText('BETA')).toBeInTheDocument();
  });
});
