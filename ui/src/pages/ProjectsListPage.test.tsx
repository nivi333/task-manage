import React from 'react';
import { render } from '@testing-library/react';

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
  const List = ({ dataSource, renderItem }: any) => (
    <ul>
      {Array.isArray(dataSource) ? dataSource.map((item: any, idx: number) => (
        <li key={idx}>{renderItem(item)}</li>
      )) : null}
    </ul>
  );
  return { Card, Space, Input, Empty, Skeleton, Tag, Avatar, Typography, List };
});

jest.mock('../services/projectService', () => ({
  __esModule: true,
  projectService: {
    list: jest.fn(),
  },
}));

import ProjectsListPage from './ProjectsListPage';
import { projectService } from '../services/projectService';

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

    // Links to dashboards
    expect(getAllByText('Open Dashboard')[0]).toHaveAttribute('href', '/projects/11111111-1111-1111-1111-111111111111/dashboard');
  });
});
