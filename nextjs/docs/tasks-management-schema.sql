CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.roles (
  id   serial PRIMARY KEY,
  name text   NOT NULL UNIQUE
);

CREATE TABLE public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id int  NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE public.tasks (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text        NOT NULL,
  description text,
  status      text        NOT NULL CHECK (status IN ('Todo','In Progress','Done')),
  priority    text        NOT NULL CHECK (priority IN ('Low','Medium','High')),
  due_date    date,
  created_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE public.task_assignees (
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, user_id)
);

CREATE TABLE public.comments (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    uuid        NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  content    text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

    CREATE TABLE public.profiles (
        id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
        email text,
        -- Add other profile-related columns here (e.g., first_name, last_name)
        PRIMARY KEY (id)
    );
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER AS $$
    BEGIN
        INSERT INTO public.profiles (id, email)
        VALUES (NEW.id, NEW.email)
        ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email; -- Add other columns to update here
        RETURN NEW;
    END;
    $$;

    CREATE TRIGGER on_new_user
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 1) task_assignees → profiles
ALTER TABLE public.task_assignees
  DROP CONSTRAINT IF EXISTS task_assignees_user_id_fkey,
  ADD CONSTRAINT task_assignees_user_id_profiles_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- 2) comments → profiles
ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_author_id_fkey,
  ADD CONSTRAINT comments_author_id_profiles_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;

-- 3) user_roles → profiles
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
  ADD CONSTRAINT user_roles_user_id_profiles_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- 4) tasks.created_by → profiles
ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_created_by_fkey,
  ADD CONSTRAINT tasks_created_by_profiles_fkey
    FOREIGN KEY (created_by)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;


ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
