# Task Management System Setup & Usage

## Database Setup

Run the following SQL scripts in your Supabase SQL Editor in this order:

### 1. Apply Database Triggers
```sql
-- File: sql/triggers.sql
-- Auto-update updated_at column for tasks table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tasks table
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Apply Performance Indexes
```sql
-- File: sql/indexes.sql
-- Performance indexes for task management

-- Index for task filtering by status (most common filter)
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Index for task filtering by priority
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

-- Index for task filtering by created_by (user's own tasks)
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);

-- Index for task sorting by created_at (default sort)
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- Index for task sorting by due_date
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date) WHERE due_date IS NOT NULL;

-- Composite index for assignee filtering (task_assignees join optimization)
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON public.task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON public.task_assignees(task_id);

-- Index for comments by task_id (for task detail view)
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON public.comments(task_id);

-- Index for comments sorting by created_at
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- Full-text search indexes for title and description
-- Using GIN index for better text search performance
CREATE INDEX IF NOT EXISTS idx_tasks_title_search ON public.tasks USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_tasks_description_search ON public.tasks USING GIN(to_tsvector('english', COALESCE(description, '')));

-- Composite index for common query patterns (status + created_at for list views)
CREATE INDEX IF NOT EXISTS idx_tasks_status_created_at ON public.tasks(status, created_at DESC);

-- Index for user profiles (used in assignee lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
```

### 3. Apply Row Level Security Policies
```sql
-- Run the complete sql/rls.sql file
-- This includes:
-- - Enabling RLS on all tables
-- - Helper functions for admin checks and task access
-- - Comprehensive policies for tasks, task_assignees, comments, and profiles
```

## API Endpoints

The system provides the following RESTful API endpoints:

### Tasks
- `GET /api/tasks` - List tasks with filtering, search, sort, and pagination
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a specific task with assignees and comments
- `PUT /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

### Task Assignment
- `POST /api/tasks/[id]/assign` - Assign/unassign users to a task

### Comments
- `GET /api/tasks/[id]/comments` - Get comments for a task
- `POST /api/tasks/[id]/comments` - Create a comment on a task
- `PUT /api/comments/[id]` - Update a comment
- `DELETE /api/comments/[id]` - Delete a comment

### Users
- `GET /api/users` - Get all users (for assignee dropdowns)

## Query Parameters for Task Listing

The `GET /api/tasks` endpoint supports these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Text search in title and description
- `status` - Filter by status ('Todo', 'In Progress', 'Done', or 'all')
- `priority` - Filter by priority ('Low', 'Medium', 'High', or 'all')
- `assignee` - Filter by assignee user ID
- `due_from` - Filter tasks due from this date (ISO string)
- `due_to` - Filter tasks due until this date (ISO string)
- `sort` - Sort field ('created_at', 'updated_at', 'due_date', 'title', 'priority', 'status')
- `order` - Sort order ('asc' or 'desc')

## Example API Requests

### Create a Task
```bash
curl -X POST /api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user dashboard",
    "description": "Create a user dashboard with analytics",
    "status": "Todo",
    "priority": "High",
    "due_date": "2024-02-15T10:00:00Z",
    "assignees": ["user-id-1", "user-id-2"]
  }'
```

### Search and Filter Tasks
```bash
curl "/api/tasks?search=dashboard&status=Todo&priority=High&page=1&limit=10&sort=due_date&order=asc"
```

### Assign Users to Task
```bash
curl -X POST /api/tasks/task-id-123/assign \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["user-id-1", "user-id-2"]
  }'
```

### Add Comment to Task
```bash
curl -X POST /api/tasks/task-id-123/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This looks great! Let me know when it's ready for review."
  }'
```

## Security Features

### Row Level Security (RLS)
- **Tasks**: Users can only access tasks they created or are assigned to
- **Comments**: Users can only view/create comments on tasks they have access to
- **Task Assignments**: Only task creators can manage assignees
- **Admin Override**: Users with 'admin' role can access all resources

### Input Validation
- All inputs are validated using Zod schemas
- SQL injection prevention through parameterized queries
- XSS protection through proper data sanitization

### Authentication
- All endpoints require valid Supabase authentication
- User context is automatically provided via Supabase Auth

## Component Architecture

### Main Components
- `TaskManagementPage` - Main page with task grid layout
- `TaskForm` - Create/edit task form with all fields
- `TaskFilters` - Advanced filtering and search interface
- `Pagination` - Server-side pagination component

### Hooks
- `useTasks` - Fetch and manage task list with filters
- `useTaskMutations` - Handle create, update, delete operations
- `useComments` - Manage task comments

### Key Features
- **Real-time Updates**: Automatic refresh after mutations
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Comprehensive error states and messages
- **Loading States**: Loading indicators for all async operations
- **Responsive Design**: Mobile-friendly card layout
- **Search & Filter**: Full-text search with multiple filters
- **Sorting**: Multiple sort options with ascending/descending order
- **Pagination**: Efficient server-side pagination

## Performance Optimizations

### Database Level
- Strategic indexes for common query patterns
- Full-text search indexes for title/description
- Composite indexes for filtering combinations
- Optimized join queries with proper index usage

### API Level
- Efficient pagination with limit/offset
- Selective field loading based on requirements
- Proper caching headers for static content
- Rate limiting through Supabase built-ins

### Frontend Level
- Debounced search input to reduce API calls
- Optimistic updates for immediate feedback
- Proper loading states to improve perceived performance
- Grid layout with responsive design

## Testing

### Manual Testing Checklist
- [ ] Create task with all fields
- [ ] Edit task title, description, status, priority, due date
- [ ] Assign and unassign users to tasks
- [ ] Search tasks by title and description
- [ ] Filter by status, priority, assignee, date range
- [ ] Sort by different fields and orders
- [ ] Navigate through pages
- [ ] Add, edit, delete comments
- [ ] Test permissions (non-admin vs admin users)
- [ ] Test error handling (invalid data, network errors)

### API Testing with cURL
Use the example cURL commands above to test each endpoint manually.

## Deployment Considerations

### Environment Variables
Ensure these are properly set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database Migration
Run the SQL scripts in the correct order during deployment.

### Performance Monitoring
Monitor these metrics:
- API response times
- Database query performance
- Search query performance
- Page load times

## Troubleshooting

### Common Issues
1. **RLS Policies**: Ensure all tables have proper RLS policies enabled
2. **Indexes**: Verify all indexes are created for optimal performance
3. **Authentication**: Check Supabase auth configuration
4. **Type Errors**: Ensure TypeScript types match database schema
5. **CORS**: Verify API routes are properly configured for client access

### Performance Issues
1. Check database query performance in Supabase dashboard
2. Monitor API response times
3. Verify indexes are being used effectively
4. Consider adding caching for frequently accessed data

This completes the production-ready Task Management system with comprehensive CRUD operations, advanced filtering, secure RLS policies, and optimized performance.