-- Row Level Security Policies for Task Management

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  return exists(
    select 1 from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where ur.user_id = user_id and r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can access task (creator or assignee)
CREATE OR REPLACE FUNCTION can_access_task(task_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  return exists(
    select 1 from public.tasks t
    where t.id = task_id 
    and (
      t.created_by = user_id
      or exists(
        select 1 from public.task_assignees ta 
        where ta.task_id = task_id and ta.user_id = user_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TASKS TABLE POLICIES
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view tasks they created or are assigned to" ON public.tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON public.tasks;
DROP POLICY IF EXISTS "Admins can update all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks they created" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete all tasks" ON public.tasks;

-- Tasks: Read policies
CREATE POLICY "Users can view tasks they created or are assigned to" ON public.tasks
FOR SELECT USING (
    auth.uid() = created_by 
    OR EXISTS (
        SELECT 1 FROM public.task_assignees ta 
        WHERE ta.task_id = id AND ta.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all tasks" ON public.tasks
FOR SELECT USING (is_admin(auth.uid()));

-- Tasks: Create policies
CREATE POLICY "Users can create tasks" ON public.tasks
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Tasks: Update policies
CREATE POLICY "Users can update tasks they created or are assigned to" ON public.tasks
FOR UPDATE USING (
    auth.uid() = created_by 
    OR EXISTS (
        SELECT 1 FROM public.task_assignees ta 
        WHERE ta.task_id = id AND ta.user_id = auth.uid()
    )
) WITH CHECK (
    auth.uid() = created_by 
    OR EXISTS (
        SELECT 1 FROM public.task_assignees ta 
        WHERE ta.task_id = id AND ta.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can update all tasks" ON public.tasks
FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Tasks: Delete policies
CREATE POLICY "Users can delete tasks they created" ON public.tasks
FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete all tasks" ON public.tasks
FOR DELETE USING (is_admin(auth.uid()));

-- TASK_ASSIGNEES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view task assignments for accessible tasks" ON public.task_assignees;
DROP POLICY IF EXISTS "Admins can view all task assignments" ON public.task_assignees;
DROP POLICY IF EXISTS "Task creators can manage assignments" ON public.task_assignees;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.task_assignees;

-- Task Assignees: Read policies
CREATE POLICY "Users can view task assignments for accessible tasks" ON public.task_assignees
FOR SELECT USING (can_access_task(task_id, auth.uid()));

CREATE POLICY "Admins can view all task assignments" ON public.task_assignees
FOR SELECT USING (is_admin(auth.uid()));

-- Task Assignees: Insert/Update/Delete policies
CREATE POLICY "Task creators can manage assignments" ON public.task_assignees
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.id = task_id AND t.created_by = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.id = task_id AND t.created_by = auth.uid()
    )
);

CREATE POLICY "Admins can manage all assignments" ON public.task_assignees
FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- COMMENTS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view comments on accessible tasks" ON public.comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments on accessible tasks" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update all comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete all comments" ON public.comments;

-- Comments: Read policies
CREATE POLICY "Users can view comments on accessible tasks" ON public.comments
FOR SELECT USING (can_access_task(task_id, auth.uid()));

CREATE POLICY "Admins can view all comments" ON public.comments
FOR SELECT USING (is_admin(auth.uid()));

-- Comments: Create policies
CREATE POLICY "Users can create comments on accessible tasks" ON public.comments
FOR INSERT WITH CHECK (
    can_access_task(task_id, auth.uid()) 
    AND auth.uid() = author_id
);

-- Comments: Update policies
CREATE POLICY "Users can update their own comments" ON public.comments
FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can update all comments" ON public.comments
FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Comments: Delete policies
CREATE POLICY "Users can delete their own comments" ON public.comments
FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete all comments" ON public.comments
FOR DELETE USING (is_admin(auth.uid()));

-- PROFILES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Profiles: Read policies (needed for assignee dropdowns)
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

-- Profiles: Insert policies (for new user registration)
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Profiles: Update policies (allow users to update their own name and email)
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);