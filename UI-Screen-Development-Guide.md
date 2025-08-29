# Detailed UI Screen Development Tasks

> **Legend:**
>
> - [x] Completed
> - [ ] To Do

This comprehensive guide provides detailed UI screen creation tasks for the Task Management application, matching the Spring Boot backend API structure. Each task includes specific requirements, components, and API integrations.

---

## 🔐 AUTHENTICATION MODULE

- [x] **Task 1: Login Screen**

  - **Priority:** HIGH | **Estimated:** 2 days
  - **Components:** LoginForm, TwoFactorModal, LoadingSpinner
  - **Features:**
    - [x] Username/email + password fields with validation
    - [x] "Remember me" checkbox
    - [x] 2FA code input modal (conditional)
    - [x] Social login buttons (Google, GitHub)
    - [x] Password visibility toggle
  - **API Integration:**
    - [x] `POST /api/v1/auth/login`
    - [x] `POST /api/v1/auth/2fa` (if 2FA enabled)
  - **Validation:**
    - [x] Email format
    - [x] Password strength (Frontend now matches backend: 8+ chars, upper, lower, digit, special char)
    - [x] Required fields
  - **Error Handling:**
    - [x] Invalid credentials
    - [x] Account locked
    - [x] 2FA required
  - **Notifications:**
    - [x] Success/failure popups at top of screen (Ant Design message)

- [x] **Task 2: Registration Screen**
  - **Priority:** HIGH | **Estimated:** 2 days
  - **Components:** RegistrationForm, PasswordStrengthMeter, TermsModal, ProfileImageCropper
  - **Features:**
    - [x] Multi-step form (Personal Info → Account Setup → Verification)
    - [x] Real-time password strength indicator
    - [ ] Email verification flow
    - [x] Terms & conditions acceptance
    - [x] Profile picture upload with cropping (optional)
  - **API Integration:**
    - [x] `POST /api/v1/auth/register` (supports multipart/form-data for profile images)
  - **Validation:**
    - [x] Unique email/username (API error handled)
    - [x] Password confirmation
    - [x] Terms acceptance
    - [x] Profile image file type and size validation
  - **Notifications:**
    - [x] Success/failure popups at top of screen (Ant Design message)

> **Note:**
>
> - RegistrationForm password validation now fully matches backend: at least 8 characters, one uppercase, one lowercase, one digit, one special character.
> - Login and Registration now show top-of-screen Ant Design notifications for all success/failure outcomes.
> - **✅ GLOBAL NOTIFICATION SYSTEM IMPLEMENTED:** All API responses across the application now show success/error popups using a centralized notification service with proper Ant Design v5+ context.
> - Profile image upload with cropping functionality fully implemented using react-easy-crop library.

- [x] **Task 3: Password Reset Flow**
  - **Priority:** MEDIUM | **Estimated:** 1.5 days | **✅ COMPLETED**
  - **Components:** ForgotPasswordForm, ResetPasswordForm, SuccessMessage
  - **Features:**
    - [x] Email input for reset request with validation
    - [x] Token-based reset form with password strength meter
    - [x] Password confirmation with matching validation
    - [x] Auto-redirect to login after success with countdown
    - [x] Consistent "Back to Login" transparent button styling
    - [x] Success/error notifications using global notification system
  - **API Integration:**
    - [x] `POST /api/v1/auth/forgot-password`
    - [x] `POST /api/v1/auth/reset-password`
  - **UI/UX Enhancements:**
    - [x] Unified authentication UI styling across all screens
    - [x] Gradient primary buttons with hover animations
    - [x] Consistent transparent "Back to Login" buttons with arrow icons
    - [x] Fixed registration steps component font sizing
    - [x] Enhanced button hover effects with subtle lift animations

> **Note:**
>
> - **✅ PASSWORD RESET FLOW FULLY IMPLEMENTED:** Complete forgot password and reset password functionality with email validation, token-based reset, password strength validation, and success messaging.
> - **✅ UNIFIED AUTH UI STYLING:** All authentication screens (Login, Registration, Forgot Password, Reset Password) now have consistent button styling, gradient primary buttons, and unified "Back to Login" navigation.
> - **✅ ENHANCED USER EXPERIENCE:** Added smooth hover animations, proper visual feedback, and consistent spacing across all auth components.
> - Custom Button component created to override Ant Design defaults and ensure consistent styling.
> - Global CSS architecture implemented with proper component-specific styling.

---

## 🔔 GLOBAL NOTIFICATION SYSTEM

- [x] **Global API Response Notifications**
  - **Priority:** HIGH | **Estimated:** 0.5 days
  - **Components:** notificationService, App context provider
  - **Features:**
    - [x] Centralized notification service using Ant Design's App.useApp() hook
    - [x] Global success notifications for API responses
    - [x] Global error notifications for API failures
    - [x] Proper Ant Design v5+ context compliance
    - [x] Console logging for debugging
  - **Implementation:**
    - [x] `notificationService.ts` - Centralized service
    - [x] App.tsx restructured with AntdApp context provider
    - [x] authService.ts updated to use notification service
    - [x] Ant Design CSS import added to index.tsx
    - [x] React.StrictMode removed to fix context issues
  - **Status:** ✅ COMPLETE

---

## 👤 USER MANAGEMENT MODULE

- [x] **Task 4: User Profile Screen** | **✅ COMPLETED**

  - **Priority:** HIGH | **Estimated:** 3 days
  - **Components:** ProfileHeader, EditProfileForm, PasswordChangeForm, TwoFactorSettings
  - **Features:**
    - [x] View/edit personal information
    - [x] Profile picture upload with crop
    - [x] Password change section
    - [x] 2FA enable with QR code
    - [x] Account deletion option
    - [x] Activity log viewer

> Both features are implemented and working in the UI as of 2025-08-29.

- **API Integration:**
  - [x] `GET /api/v1/users/profile`
  - [x] `PUT /api/v1/users/profile`
  - [x] `POST /api/v1/users/change-password`
  - [x] `POST /api/v1/auth/2fa/enable`
- **Validation:**
  - [x] Required fields
  - [x] Valid email
  - [x] Password strength
- **Error Handling:**
  - [x] API errors
  - [x] Validation errors
  - [x] Unauthorized access

> **Status:** Implemented `UserProfilePage` with profile editing (including base64 profile picture), password change with validation, and 2FA enablement displaying QR code in a modal. Wired to `userService` with global notifications. Future enhancements: 2FA disable flow, account deletion, and activity log viewer.

- [x] **Task 5: User Management Dashboard (Admin)** | **✅ COMPLETED**

  - **Priority:** MEDIUM | **Estimated:** 4 days
  - **Components:** UserTable, UserFilters, BulkActions, UserModal
  - **Features:**
    - [x] Paginated user list with search/filter
    - [x] Bulk operations (delete, status change)
    - [x] User creation/editing modal
    - [x] Role assignment interface
    - [x] User status management (active/inactive)
    - [x] CSV export functionality
  - **API Integration:**
    - [x] `GET /api/v1/users` (with pagination/filters)
    - [x] `POST /api/v1/users`
    - [x] `PUT /api/v1/users/{id}`
    - [x] `DELETE /api/v1/users`
    - [x] `GET /api/v1/users/export/csv`
  - **Validation:**
    - [x] Required fields
    - [x] Valid email
    - [x] Unique username
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** Implemented admin user management UI with table, filters, bulk actions, modal forms, and service wiring. CSV export implemented via toolbar button calling `userService.exportUsers()` which hits `GET /api/v1/users/export/csv` and downloads a CSV.

---

## 📋 TASK MANAGEMENT MODULE

- [x] **Task 6: Task Dashboard/List View**

  - **Priority:** HIGH | **Estimated:** 5 days
  - **Components:** TaskBoard, TaskCard, FilterSidebar, QuickActions, TaskStats
  - **Features:**
    - [x] Kanban board view (To Do, In Progress, Done)
    - [x] List view with sorting/filtering
    - [x] Task cards with priority indicators
    - [x] Drag-and-drop functionality
    - [x] Quick task creation
    - [x] Advanced filters (status, priority, assignee, date range)
    - [x] Task statistics dashboard
  - **API Integration:**
    - [x] `GET /api/v1/tasks` (with advanced filtering)
    - [x] `PUT /api/v1/tasks/{id}` (for status updates)
  - **Validation:**
    - [x] Required fields
    - [x] Valid status
    - [x] Filter logic
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** Task Dashboard/List View fully implemented with Kanban and List views, advanced filtering, quick creation, validation, and error handling. Ready for QA and user feedback.

- [x] **Task 7: Task Creation/Edit Form**

  - **Priority:** HIGH | **Estimated:** 3 days
  - **Components:** TaskForm, DatePicker, UserSelector, TagInput, FileUpload (UI), DependencySelector, RecurringOptions
  - **Features:**
    - [x] Description text area (rich editor deferred)
    - [x] Due date picker with calendar
    - [x] Priority selection (High, Medium, Low)
    - [x] Assignee selection with search
    - [x] Tag management with autocomplete
    - [x] File attachments (UI only; backend upload wiring TBD)
    - [x] Task dependencies selection (search tasks)
    - [x] Recurring task options (frequency/interval/count)
  - **API Integration:**
    - [x] `POST /api/v1/tasks`
    - [x] `PUT /api/v1/tasks/{id}`
    - [x] `GET /api/v1/users` (for assignee dropdown)
  - **Routes:**
    - [x] `/tasks/new` — Create Task page
    - [x] `/tasks/:id/edit` — Edit Task page
  - **Validation:**
    - [x] Required fields (Title)
    - [x] Valid dates
    - [x] Valid priority
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** Task Creation/Edit Form fully implemented with all required UI fields, advanced options, validation, and API integration. Ready for QA and user feedback.

- [x] **Task 8: Task Detail View**

  - **Priority:** HIGH | **Estimated:** 4 days
  - **Components:** TaskHeader, TaskDescription, CommentSection, ActivityTimeline, TimeTracker
  - **Features:**
    - [x] Full task information display
    - [x] Inline editing capabilities
    - [x] Comment system with mentions
    - [x] Activity/audit log
    - [x] Time tracking start/stop
    - [x] File attachment viewer
    - [x] Task dependency visualization
    - [x] Subtask management
  - **API Integration:**
    - [x] `GET /api/v1/tasks/{id}`
    - [x] `GET /api/v1/tasks/{taskId}/comments`
    - [x] `POST /api/v1/tasks/{taskId}/comments`
    - [x] `POST /api/v1/task-time-tracking`
  - **Validation:**
    - [x] Required fields
    - [x] Valid comments
    - [x] Valid time entries
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** Task Detail View fully implemented with modular components, API integration, validation, and error handling. Ready for QA and user feedback.

- [x] **Task 25: Tags Management (Modal)** | **✅ COMPLETED**

  - **Priority:** MEDIUM | **Estimated:** 1.5 days
  - **Components:** TagsManageButton, TagsManageModal, TagList, TagSearch, TagActions
  - **Features:**
    - [x] Show distinct tags with usage count (e.g., "bug (12)")
    - [x] Search/filter tags in-modal
    - [x] Rename tag (cascades across all tasks)
    - [x] Merge tags (from → to) with preview of affected count
    - [x] Delete tag (remove from all tasks) with confirmation
    - [x] Case-insensitive de-duplication and normalization (trim, single spaces)
    - [x] Integrate with Task filters and `TagInput` suggestions automatically
  - **API Integration:**
    - [x] `GET /api/v1/tags` — list distinct tags with usage counts
    - [x] `PATCH /api/v1/tags/{name}/rename` — rename a tag across tasks
    - [x] `POST /api/v1/tags/merge` — merge tags `{ from: string; to: string }`
    - [x] `DELETE /api/v1/tags/{name}` — delete (remove from all tasks)
  - **Validation:**
    - [x] Tag name rules: length 1–32, no leading/trailing spaces, no double spaces
    - [x] Prevent duplicates after normalization (case-insensitive)
    - [x] Confirm destructive actions (merge/delete)
  - **Error Handling:**
    - [x] API errors (global notifications)
    - [x] Conflict/duplicate name on rename/merge
    - [x] Unauthorized access
  - **Routes & Placement:**
    - [x] No standalone route; launch modal from Task List header toolbar near Tags filter
    - [x] Also link from Tags filter dropdown empty state: "Manage Tags"
  - **Status:** ✅ COMPLETE — Implemented modal with list/search/rename/merge/delete, normalization and duplicate prevention, global notifications, and integration with Task filters and `TagInput`. Modal accessible from header toolbar and tags filter dropdown.

- [ ] **Task 9: Task Comments & Collaboration**

  - **Priority:** MEDIUM | **Estimated:** 2 days
  - **Components:** CommentList, CommentForm, MentionInput, ReplyThread
  - **Features:**
    - [x] Threaded comments with replies (fully recursive with expand/collapse)
    - [x] @mention functionality with user search (Antd Mentions + async search)
    - [ ] Rich text formatting (pending)
    - [x] Comment editing/deletion (inline edit + delete with confirmation)
    - [x] Real-time updates (Socket.io + STOMP) with fallback polling
  - **API Integration:**
    - [x] `GET /api/v1/tasks/{taskId}/comments`
    - [x] `POST /api/v1/tasks/{taskId}/comments`
    - [x] `PUT /api/v1/tasks/{taskId}/comments/{commentId}`
    - [x] `DELETE /api/v1/tasks/{taskId}/comments/{commentId}`
  - **Validation:**
    - [x] Required fields (non-empty content; client-side)
    - [ ] Valid mentions (pending stricter validation rules)
    - [ ] WebSocket connection indicator (optional UI; pending)
  - **Error Handling:**
    - [x] API errors (global notifications)
    - [x] Validation errors
    - [x] Unauthorized access (auth interceptor)

  > **Status:** In Progress — Frontend now includes fully recursive threaded comments with inline reply/edit/delete, live updates via Socket.io and STOMP, optimistic UI with rollback, mentions with async user search, fallback polling, and accessibility (`aria-live`). Remaining: rich text formatting + HTML sanitization, stricter mentions validation, optional connection indicator, and tests.

  - **Routes & Placement:**
    - [x] `/tasks/:id` — Comments section inside `TaskDetailPage`
    - [x] Deep link support: `/tasks/:id?tab=comments`
  - **Real-time & Delivery:**
    - [x] Establish WebSocket channel (Socket.io) and STOMP topic for comments
    - [x] Fallback polling every 20s
    - [x] Optimistic UI for create/edit/delete with rollback on failure
    - [x] In-app toast via `notificationService` for mentions and failures
  - **UI/UX Details:**
    - [ ] Rich text editor with basic formatting (bold, italic, code, lists)
    - [x] `@mention` dropdown with async search against `userService`
    - [x] Inline edit with ESC to cancel, Enter/Cmd+Enter to save
    - [x] Reply threads collapsed by default beyond 2 replies ("Show more")
    - [x] Empty state with helpful prompt
    - [x] Accessibility: aria-live region for new comment announcements
  - **Security & Moderation:**
    - [ ] Sanitize HTML output; only allow a safe subset of tags/marks
    - [x] Rate-limit client submissions to prevent spam (client-side 1.5s)
    - [x] Permissions: author or admin can edit/delete
  - **Status:** Updated — Backend CRUD done; websockets integrated on frontend; pending RTE selection and sanitization

- [x] **Task 10: Project Dashboard** | **✅ COMPLETED**

  - **Priority:** HIGH | **Estimated:** 4 days
  - **Components:** ProjectHeader, ProjectStats, TaskSummary, TeamMembers, ProgressCharts
  - **Features:**
    - [x] Project overview with key metrics
    - [x] Task completion progress
    - [x] Team member list with roles
    - [x] Burndown chart
    - [x] Timeline view
    - [x] Recent activity feed
  - **API Integration:**
    - [x] `GET /api/v1/projects/{id}`
    - [x] `GET /api/v1/projects/{id}/dashboard`
    - [x] `GET /api/v1/projects/{id}/analytics/burndown`
  - **Validation:**
    - [x] Required fields
    - [x] Valid project id
    - [x] Valid analytics data
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

- [x] **Task 11: Project List & Management**

  - **Priority:** MEDIUM | **Estimated:** 3 days
  - **Components:** ProjectGrid, ProjectCard, ProjectFilters, CreateProjectModal
  - **Features:**
    - [x] Grid/list view toggle
    - [x] Project cards with progress indicators
    - [x] Filter by status and date
    - [x] Filter by team
    - [x] Project creation (modal)
    - [x] Bulk project operations (delete selected)
  - **API Integration:**
    - [x] `GET /api/v1/projects`
    - [x] `POST /api/v1/projects`
    - [x] `PUT /api/v1/projects/{id}`
  - **Validation:**
    - [x] Required fields
    - [x] Valid project data
    - [x] Unique project name
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** ✅ COMPLETED — `ProjectsListPage` now includes search, status/date filters, grid/list toggle, project cards with progress indicators, team filter, project creation, edit/update flow, and bulk delete. Fully wired to `projectService.list`, `projectService.create`, `projectService.update`, and `projectService.bulkDelete`. Client-side unique project name validation implemented for create and edit modals.

- [x] **Task 12: Project Team Management** | **✅ COMPLETED**

  - **Priority:** MEDIUM | **Estimated:** 3 days
  - **Components:** TeamMemberList, InviteModal, RoleSelector, PermissionMatrix
  - **Features:**
    - [x] Team member list with roles
    - [x] Invite new members via email
    - [x] Role assignment (Owner, Manager, Member)
    - [x] Permission management
    - [x] Member removal with confirmation
  - **API Integration:**
    - [x] `GET /api/v1/projects/{id}/members`
    - [x] `POST /api/v1/projects/{id}/members`
    - [x] `PATCH /api/v1/projects/{id}/members/{userId}/role`
  - **Validation:**
    - [x] Required fields
    - [x] Valid email
    - [x] Valid role
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

- [x] **Task 13: Team Dashboard** | **✅ COMPLETED**

  - **Priority:** MEDIUM | **Estimated:** 3 days
  - **Components:** TeamHeader, MemberGrid, TeamStats, RecentActivity
  - **Features:**
    - [x] Team overview with member count
    - [x] Member cards with contact info
    - [x] Team performance metrics
    - [x] Recent team activity
    - [x] Team calendar integration
  - **API Integration:**
    - [x] `GET /api/v1/teams/{id}`
    - [x] `GET /api/v1/teams/{id}/members`
  - **Validation:**
    - [x] Required fields
    - [x] Valid team id
    - [x] Valid member data
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

- [x] **Task 14: Team Creation & Management** | **✅ COMPLETED**

  - **Priority:** LOW | **Estimated:** 2 days
  - **Components:** TeamForm, MemberSelector, TeamSettings
  - **Features:**
    - [x] Team creation form
    - [x] Add/remove team members
    - [x] Team settings configuration
    - [x] Team deletion with confirmation
  - **API Integration:**
    - [x] `POST /api/v1/teams`
    - [x] `PUT /api/v1/teams/{id}`
    - [x] `POST /api/v1/teams/{id}/members`
    - [x] `DELETE /api/v1/teams/{id}/members`
  - **Validation:**
    - [x] Required fields
    - [x] Valid team name
    - [x] Unique team name (backend enforced; frontend name min length check)
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

- [x] **Task 15: Notification Center**

  - **Priority:** MEDIUM | **Estimated:** 3 days
  - **Components:** NotificationList, NotificationItem, FilterTabs, BulkActions
  - **Features:**
    - [x] Notification list with read/unread status
    - [x] Filter tabs (All, Unread, Archived)
    - [x] Mark as read/unread functionality
    - [x] Bulk mark as read
    - [x] Archive/delete notifications
    - [x] Real-time notification updates (30s polling with cleanup)
  - **API Integration:**
    - [x] `GET /api/v1/notifications?userId={userId}`
    - [x] `PUT /api/v1/notifications/{id}/read`
    - [x] `PUT /api/v1/notifications/{id}/archive`
    - [x] `DELETE /api/v1/notifications/{id}`
  - **Validation:**
    - [x] Required fields
    - [x] Valid notification id
    - [x] Valid user id
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** ✅ COMPLETED — Implemented `NotificationCenterPage` at `/notifications` with filter tabs, list table, per-item actions (read/unread, archive, delete), and bulk actions (mark read, archive, delete). Integrated with `notificationsService` methods, global `notificationService` for feedback, and basic real-time updates via 30s polling. Navigation link added in `AppLayout` (Sider) with bell icon.

- [x] **Task 16: Notification Preferences**

  - **Priority:** LOW | **Estimated:** 1 day
  - **Components:** PreferencesForm, ToggleSwitch, NotificationTypes
  - **Features:**
    - [x] Email notification toggle
    - [x] Web notification toggle
    - [x] Batch notification settings
    - [x] Notification type preferences
  - **API Integration:**
    - [x] `GET /api/v1/notification-preferences?userId={userId}`
    - [x] `PUT /api/v1/notification-preferences?userId={userId}`
  - **Validation:**
    - [x] Required fields
    - [x] Valid user id
    - [x] Valid notification type
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** ✅ COMPLETED — Preferences are now embedded in the Notification Center as a Settings drawer opened via a gear icon. No separate route in the sidebar. Deep-link supported via `/notifications?settings=1`. The legacy route `/notification-preferences` redirects to `/notifications?settings=1` for backward compatibility. Integrated with `notificationPreferencesService.get` and `.update`, using the global `notificationService` for feedback.

- [x] **Task 17: Global Search Interface**

  - **Priority:** MEDIUM | **Estimated:** 2 days
  - **Components:** SearchBar, SearchResults, FilterChips, SearchHistory
  - **Features:**
    - [x] Global search with filters and quick submit
    - [x] Search across tasks, projects, users, comments
    - [x] Search filters and sorting
    - [x] Search history and saved searches
  - **API Integration:**
    - [x] `GET /api/v1/search?query=...`
    - [x] `GET /api/v1/saved-searches`
    - [x] `POST /api/v1/saved-searches`
  - **Validation:**
    - [x] Required fields
    - [x] Valid search query
    - [x] Valid search filters
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** ✅ COMPLETED — Implemented `GlobalSearchPage` at `/search` integrating `SearchBar`, `FilterChips`, `SearchResults`, and `SearchHistory`. Wired to `searchService.search`, `.listSavedSearches`, and `.saveSavedSearch`. Sider navigation item added.

- [x] **Task 18: Analytics Dashboard**

  - **Priority:** LOW | **Estimated:** 3 days
  - **Components:** ChartContainer, MetricCards, DateRangePicker, ExportButton
  - **Features:**
    - [x] Task completion trends
    - [x] Team productivity metrics
    - [x] Project timeline analysis
    - [x] Custom date range selection
  - **API Integration:**
    - [x] `GET /api/v1/analytics/summary`
    - [x] `GET /api/v1/analytics/timeline`
    - [x] `GET /api/v1/analytics/team-productivity`
  - **Validation:**
    - [x] Required fields
    - [x] Valid date range
    - [x] Valid analytics data
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** ✅ COMPLETED — Implemented `AnalyticsDashboardPage` at `/analytics` with `MetricCards`, `ChartContainer`, `ExportButton`, and `TTDateRangePicker`. Integrated API calls via `analyticsService` (`getSummary`, `getTimeline`, `getTeamProductivity`) and added Sider navigation link.

- [x] **Task 19: Settings & Preferences**

  - **Priority:** LOW | **Estimated:** 2 days
  - **Components:** SettingsForm, ThemeSelector, LanguageSelector, NotificationSettings
  - **Features:**
    - [x] User profile settings (Full Name, Display Name, Timezone)
    - [x] Theme selection (light/dark/system)
    - [x] Language selection
    - [x] Notification preferences (email/web/batch + types)
  - **API Integration:**
    - [ ] `GET /api/v1/settings`
    - [ ] `PUT /api/v1/settings`
  - **Validation:**
    - [x] Required fields (Full Name, Theme, Language)
    - [x] Valid settings data (typed `UserSettings` model)
    - [x] Valid theme/language
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

  > **Status:** Implemented `AdminController` with `/api/v1/admin/*` endpoints, `AdminDashboardPage` with tabs for System Stats, User Audit Logs, and Configuration. Route protected via `AdminRoute` at `/admin`.

- [x] **Task 20: Administration Panel** | **✅ COMPLETED**

  - **Priority:** LOW | **Estimated:** 2 days
  - **Components:** AdminDashboard, UserAuditLog, SystemStats, ConfigEditor
  - **Features:**
    - [x] System statistics dashboard
    - [x] User audit logs
    - [x] Configuration editor
    - [x] Admin-only controls
  - **API Integration:**
    - [x] `GET /api/v1/admin/stats`
    - [x] `GET /api/v1/admin/audit-logs`
    - [x] `PUT /api/v1/admin/config`
  - **Validation:**
    - [x] Required fields
    - [x] Valid admin permissions
    - [x] Valid config data
  - **Error Handling:**
    - [x] API errors
    - [x] Validation errors
    - [x] Unauthorized access

- [ ] **Task 21: Mobile & PWA Support**

  - **Priority:** MEDIUM | **Estimated:** 3 days
  - **Components:** MobileNav, OfflineBanner, PushNotificationSetup, InstallPrompt
  - **Features:**
    - [ ] Responsive mobile navigation
    - [ ] Offline support
    - [ ] Push notifications
    - [ ] Install prompt for PWA
  - **API Integration:**
    - [ ] `GET /api/v1/mobile/config`
    - [ ] `POST /api/v1/mobile/push-token`
  - **Validation:**
    - [ ] Required fields
    - [ ] Valid push token
    - [ ] Valid mobile config
  - **Error Handling:**
    - [ ] API errors
    - [ ] Validation errors
    - [ ] Unauthorized access

- [ ] **Task 22: UI/UX Enhancements**

  - **Priority:** LOW | **Estimated:** 1.5 days
  - **Components:** AnimationWrapper, Tooltip, AccessibilityPanel
  - **Features:**
    - [ ] Smooth transitions/animations
    - [ ] Tooltips for buttons/fields
    - [ ] Accessibility improvements
  - **Validation:**
    - [ ] Required fields
    - [ ] Valid accessibility features
  - **Error Handling:**
    - [ ] UI bugs
    - [ ] Accessibility issues

- [ ] **Task 23: Documentation & Help**

  - **Priority:** LOW | **Estimated:** 1 day
  - **Components:** HelpModal, FAQSection, DocsLink
  - **Features:**
    - [ ] In-app help modal
    - [ ] FAQ section
    - [ ] Documentation links
  - **Validation:**
    - [ ] Required fields
    - [ ] Valid help content
  - **Error Handling:**
    - [ ] Missing documentation
    - [ ] Outdated help content

- [ ] **Task 24: Testing & QA**
  - **Priority:** LOW | **Estimated:** 2 days
  - **Components:** TestSuite, CoverageReport, BugReportForm
  - **Features:**
    - [ ] Automated test suite
    - [ ] Code coverage reporting
    - [ ] Bug report submission
  - **Validation:**
    - [ ] Required fields
    - [ ] Valid test results
    - [ ] Valid bug report
  - **Error Handling:**
    - [ ] Test failures
    - [ ] Bug report errors

### Task 8: Task Detail View

**Priority: HIGH** | **Estimated: 4 days** | **✅ COMPLETED**

- **Components**: TaskHeader, TaskDescription, CommentSection, ActivityTimeline, TimeTracker
- **Features**:
  - Full task information display
  - Inline editing capabilities
  - Comment system with mentions
  - Activity/audit log
  - Time tracking start/stop
  - File attachment viewer
  - Task dependency visualization
  - Subtask management
- **API Integration**:
  - `GET /api/v1/tasks/{id}`
  - `GET /api/v1/tasks/{taskId}/comments`
  - `POST /api/v1/tasks/{taskId}/comments`
  - `POST /api/v1/task-time-tracking`

### Task 9: Task Comments & Collaboration

**Priority: MEDIUM** | **Estimated: 2 days**

- **Components**: CommentList, CommentForm, MentionInput, ReplyThread
- **Features**:
  - Threaded comments with replies
  - @mention functionality with user search
  - Rich text formatting
  - Comment editing/deletion
  - Real-time updates (WebSocket)
- **API Integration**:
  - `GET /api/v1/tasks/{taskId}/comments`
  - `POST /api/v1/tasks/{taskId}/comments`
  - `PUT /api/v1/tasks/{taskId}/comments/{commentId}`
  - `DELETE /api/v1/tasks/{taskId}/comments/{commentId}`

---

## 🏗️ PROJECT MANAGEMENT MODULE

### Task 10: Project Dashboard

**Priority: HIGH** | **Estimated: 4 days**

- **Components**: ProjectHeader, ProjectStats, TaskSummary, TeamMembers, ProgressCharts
- **Features**:
  - [x] Project overview with key metrics
  - [x] Task completion progress
  - [x] Team member list with roles
  - [x] Burndown chart
  - [x] Timeline view
  - [x] Recent activity feed
- **API Integration**:
  - [x] `GET /api/v1/projects/{id}`
  - [x] `GET /api/v1/projects/{id}/dashboard`
  - [x] `GET /api/v1/projects/{id}/analytics/burndown`
- **Routes**:
- [x] `/projects/:id/dashboard` (Protected)
- **Validation & Error Handling**:
- [x] Valid project id (basic UUID validation)
- [x] Analytics data sanitized (invalid points filtered, info notification shown)
- [x] API errors (global notifications)
- [x] Unauthorized access (auth interceptor)

> **Status:** Implemented `ProjectDashboardPage` composing `ProjectHeader`, `ProjectStats`, `TaskSummary`, `TeamMembers`, charts, timeline, and recent activity. Data is fetched via `projectService.getDashboard` and `projectService.getBurndown`. Route added at `/projects/:id/dashboard` and integrated with global notification system.

### Task 12: Project Team Management

**Priority: MEDIUM** | **Estimated: 3 days**

- **Components**: TeamMemberList, InviteModal, RoleSelector, PermissionMatrix
- **Features**:
  - Team member list with roles
  - Invite new members via email
  - Role assignment (Owner, Manager, Member)
  - Permission management
  - Member removal with confirmation
- **API Integration**:
  - `GET /api/v1/projects/{id}/members`
  - `POST /api/v1/projects/{id}/members`
  - `PATCH /api/v1/projects/{id}/members/{userId}/role`

---

## 👥 TEAM MANAGEMENT MODULE

### Task 13: Team Dashboard | **✅ COMPLETED**

**Priority: MEDIUM** | **Estimated: 3 days**

- **Components**: TeamHeader, MemberGrid, TeamStats, RecentActivity
- **Features**:
  - [x] Team overview with member count
  - [x] Member cards with contact info
  - [x] Team performance metrics
  - [x] Recent team activity
  - [x] Team calendar integration
- **API Integration**:
  - [x] `GET /api/v1/teams/{id}`
  - [x] `GET /api/v1/teams/{id}/members`
- **Validation**:
  - [x] Required fields
  - [x] Valid team id
  - [x] Valid member data
- **Error Handling**:

  - [x] API errors
  - [x] Validation errors
  - [x] Unauthorized access

- **Routes & Navigation**:
  - [x] `/teams` — Teams list (with create modal and manage drawer)
  - [x] `/teams/:id/settings` — Dedicated Team Settings page (members + settings)

> **Status:** Implemented dedicated Team Settings page and linked it from the Teams List via a "Settings" action, while keeping the in-page "Manage" drawer.

### Task 14: Team Creation & Management | **✅ COMPLETED**

**Priority: LOW** | **Estimated: 2 days**

- **Components**: TeamForm, MemberSelector, TeamSettings
- **Features**:
  - [x] Team creation form
  - [x] Add/remove team members
  - [x] Team settings configuration
  - [x] Team deletion with confirmation
- **API Integration**:
  - [x] `POST /api/v1/teams`
  - [x] `PUT /api/v1/teams/{id}`
  - [x] `POST /api/v1/teams/{id}/members`
  - [x] `DELETE /api/v1/teams/{id}/members`
- **Validation**:
  - [x] Required fields
  - [x] Valid team name
  - [x] Unique team name (backend enforced; frontend name min length check)
- **Error Handling**:
  - [x] API errors
  - [x] Validation errors
  - [x] Unauthorized access

---

## 🔔 NOTIFICATION MODULE

### Task 15: Notification Center

**Priority: MEDIUM** | **Estimated: 3 days**

- **Components**: NotificationList, NotificationItem, FilterTabs, BulkActions
- **Features**:
  - [x] Notification list with read/unread status
  - [x] Filter tabs (All, Unread, Archived)
  - [x] Mark as read/unread functionality
  - [x] Bulk mark as read
  - [x] Archive/delete notifications
  - [x] Real-time notification updates
- **API Integration**:
  - [x] `GET /api/v1/notifications?userId={userId}`
  - [x] `PUT /api/v1/notifications/{id}/read`
  - [x] `PUT /api/v1/notifications/{id}/archive`
  - [x] `DELETE /api/v1/notifications/{id}`

> **Status:** ✅ COMPLETED — Notification Center available at `/notifications`, wired to `notificationsService`, with bulk actions and polling every 30s. Navigation link added to the Sider (bell icon).

### Task 16: Notification Preferences

**Priority: LOW** | **Estimated: 1 day**

- **Components**: PreferencesForm, ToggleSwitch, NotificationTypes
- **Features**:
  - [x] Email notification toggle
  - [x] Web notification toggle
  - [x] Batch notification settings
  - [x] Notification type preferences
- **API Integration**:
  - [x] `GET /api/v1/notification-preferences?userId={userId}`
  - [x] `PUT /api/v1/notification-preferences?userId={userId}`

> **Status:** ✅ COMPLETED — Preferences page implemented with route and service integration; supports batch frequency (Hourly/Daily/Weekly) and per-type toggles.

---

## 🔍 SEARCH & ANALYTICS MODULE

### Task 17: Global Search Interface

**Priority: MEDIUM** | **Estimated: 2 days**

- **Components**: SearchBar, SearchResults, FilterChips, SearchHistory
- **Features**:
  - [x] Global search with autocomplete
  - [x] Search across tasks, projects, users, comments
  - [x] Search filters and sorting
  - [x] Search history
  - [x] Saved searches management
- **API Integration**:
  - [x] `GET /api/v1/search?query=...`
  - [x] `GET /api/v1/saved-searches`
  - [x] `POST /api/v1/saved-searches`

### Task 18: Analytics Dashboard

**Priority: LOW** | **Estimated: 3 days**

- **Components**: ChartContainer, MetricCards, DateRangePicker, ExportButton
- **Features**:
  - [x] Task completion trends
  - [x] Team productivity metrics
  - [x] Project timeline analysis
  - [x] Custom date range selection
  - [x] Export reports functionality
- **API Integration**:
  - [x] `GET /api/v1/projects/{id}/analytics/timeline`
  - [x] Custom analytics endpoints

---

## 🔧 SETTINGS & ADMINISTRATION

### Task 19: API Key Management

**Priority: LOW** | **Estimated: 2 days**

- **Components**: ApiKeyList, GenerateKeyModal, KeyDetails, CopyButton
- **Features**:
  - List existing API keys
  - Generate new API keys
  - Copy key to clipboard
  - Delete API keys with confirmation
  - Key usage statistics
- **API Integration**:
  - `GET /api/v1/apikeys`
  - `POST /api/v1/apikeys/generate`
  - `DELETE /api/v1/apikeys/{id}`

### Task 20: Integration Settings

**Priority: LOW** | **Estimated: 2 days**

- **Components**: IntegrationList, OAuth2Setup, CalendarSync, WebhookConfig
- **Features**:
  - Calendar integration setup
  - OAuth2 provider connections
  - Webhook configuration
  - Integration status indicators
- **API Integration**:
  - `GET /api/v1/oauth2/authorize/{provider}`
  - `POST /api/v1/integrations/calendar/create-event`

---

## 📱 RESPONSIVE & MOBILE CONSIDERATIONS

### Task 21: Mobile Optimization

**Priority: MEDIUM** | **Estimated: 3 days**

- **Components**: MobileNavigation, SwipeGestures, TouchOptimization
- **Features**:
  - Responsive design for all screens
  - Mobile-first navigation
  - Touch-friendly interactions
  - Offline capability (PWA)
  - Push notifications

### Task 22: Progressive Web App (PWA)

**Priority: LOW** | **Estimated: 2 days**

- **Components**: ServiceWorker, AppManifest, OfflineIndicator
- **Features**:
  - Installable web app
  - Offline functionality
  - Background sync
  - Push notifications
  - App-like experience

---

## 🎨 UI/UX ENHANCEMENTS

### Task 23: Theme & Customization

**Priority: LOW** | **Estimated: 2 days**

- **Components**: ThemeProvider, ColorPicker, LayoutSelector
- **Features**:
  - Dark/light theme toggle
  - Custom color schemes
  - Layout preferences
  - Font size options
  - Accessibility features

### Task 24: Loading & Error States

**Priority: MEDIUM** | **Estimated: 1 day**

- **Components**: LoadingSpinner, ErrorBoundary, EmptyState, SkeletonLoader
- **Features**:
  - Loading indicators for all async operations
  - Error handling with retry options
  - Empty state illustrations
  - Skeleton loading for better UX

---

## 📊 TOTAL ESTIMATION

- **Total Tasks**: 24
- **Estimated Development Time**: 65-70 days
- **Priority Breakdown**:
  - HIGH: 8 tasks (28 days)
  - MEDIUM: 10 tasks (25 days)
  - LOW: 6 tasks (12 days)

## 🛠️ TECHNICAL REQUIREMENTS

- **Frontend**: React 18+ with TypeScript
- **UI Library**: Ant Design 5.x
- **Styling**: Global CSS architecture (global.css, auth.css, forms.css) with Ant Design overrides; Custom Button component
- **State Management**: Redux Toolkit or Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.io or WebSocket
- **Testing**: Jest + React Testing Library

---

## 3. Task Management Screens

- **Task List / Search / Filter**
  - `GET /api/v1/tasks` (supports filtering by status, priority, project, etc.)
- **Task Details / Edit**
  - `GET /api/v1/tasks/{id}`
  - `PUT /api/v1/tasks/{id}`
- **Create Task**
  - `POST /api/v1/tasks`
- **Delete Task**
  - `DELETE /api/v1/tasks/{id}`
- **Task Comments**
  - `GET /api/v1/tasks/{taskId}/comments`
  - `POST /api/v1/tasks/{taskId}/comments`
  - `PUT /api/v1/tasks/{taskId}/comments/{commentId}`
  - `DELETE /api/v1/tasks/{taskId}/comments/{commentId}`
- **Task Time Tracking**
  - `GET /api/v1/task-time-tracking`
  - `POST /api/v1/task-time-tracking`
  - `DELETE /api/v1/task-time-tracking/{id}`
- **Task Dependencies**
  - `GET /api/v1/task-dependencies`
  - `POST /api/v1/task-dependencies`
  - `DELETE /api/v1/task-dependencies/{id}`

---

## 4. Project Management Screens

- **Project List**
  - `GET /api/v1/projects`
- **Project Details / Edit**
  - `GET /api/v1/projects/{id}`
  - `PUT /api/v1/projects/{id}`
  - `PATCH /api/v1/projects/{id}/status`
- **Create Project**
  - `POST /api/v1/projects`
- **Project Members**
  - `GET /api/v1/projects/{id}/members`
  - `POST /api/v1/projects/{id}/members`
  - `PATCH /api/v1/projects/{id}/members/{userId}/role`
- **Project Analytics/Dashboard**
  - `GET /api/v1/projects/{id}/dashboard`
  - `GET /api/v1/projects/{id}/analytics/burndown`
  - `GET /api/v1/projects/{id}/analytics/timeline`

---

## 5. Team Management Screens

- **Team List**
  - `GET /api/v1/teams`
- **Team Details / Edit**
  - `GET /api/v1/teams/{id}`
  - `PUT /api/v1/teams/{id}`
- **Create Team**
  - `POST /api/v1/teams`
- **Team Members**
  - `GET /api/v1/teams/{id}/members`
  - `POST /api/v1/teams/{id}/members`
  - `DELETE /api/v1/teams/{id}/members?userId={userId}`

---

## 6. Notification Screens

- **Notification List**
  - `GET /api/v1/notifications?userId={userId}`
- **Mark as Read/Archive/Unarchive**
  - `PUT /api/v1/notifications/{id}/read`
  - `PUT /api/v1/notifications/{id}/archive`
  - `PUT /api/v1/notifications/{id}/unarchive`
- **Delete Notification**
  - `DELETE /api/v1/notifications/{id}`
- **Notification Preferences**
  - `GET /api/v1/notification-preferences?userId={userId}`
  - `PUT /api/v1/notification-preferences?userId={userId}`

---

## 7. Saved Search & Search Analytics Screens

- **Saved Searches**
  - `GET /api/v1/saved-searches`
  - `POST /api/v1/saved-searches`
  - `DELETE /api/v1/saved-searches/{id}`
- **Global Search**
  - `GET /api/v1/search?query=...`
- **Search Analytics**
  - `GET /api/v1/search/analytics` (if available)

---

## 8. API Key Management Screens

- **API Key List**
  - `GET /api/v1/apikeys`
- **Generate API Key**
  - `POST /api/v1/apikeys/generate`
- **Delete API Key**
  - `DELETE /api/v1/apikeys/{id}`

---

## 9. Integration Screens (Calendar, Project Management, OAuth2)

- **Calendar Event Integration**
  - `POST /api/v1/integrations/calendar/create-event`
- **Project Management Tool Sync**
  - `POST /api/v1/integrations/project-management/sync-issue`
- **OAuth2 Authorization**
  - `GET /api/v1/oauth2/authorize/{provider}`
  - `GET /api/v1/oauth2/callback/{provider}`

---

> **Note:**
>
> - All endpoints are versioned under `/api/v1/`
> - Replace `{id}` and similar placeholders with actual IDs.
> - Use appropriate HTTP methods and payloads as per backend API specs.
>
> 2. **Import and use** it in your main app or route.
> 3. **Connect to backend** by replacing mock state and handlers with real API calls.
> 4. **Customize** fields and styles as needed for your use case.

---

## References

- [Ant Design Docs](https://ant.design/components/overview/)
- [Styled Components Docs](https://styled-components.com/docs)

---

> _Feel free to extend this guide for additional screens or features!_
