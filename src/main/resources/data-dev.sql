-- Initial development data seed for tasks_manage_dev

INSERT INTO users (id, email, username, first_name, last_name, role, status, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'admin@example.com', 'admin', 'Admin', 'User', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'user1@example.com', 'user1', 'User', 'One', 'USER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO teams (id, name, description)
VALUES
  (uuid_generate_v4(), 'Engineering', 'Engineering team'),
  (uuid_generate_v4(), 'QA', 'Quality Assurance team');

-- Add more seed data as needed for projects, tasks, etc.
