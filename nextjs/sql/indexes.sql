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