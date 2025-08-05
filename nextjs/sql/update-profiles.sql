-- Add name field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Create a function to extract default name from email
CREATE OR REPLACE FUNCTION get_default_name_from_email(email_address TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Extract the part before @ and replace dots/underscores with spaces
    RETURN COALESCE(
        INITCAP(
            REPLACE(
                REPLACE(
                    SPLIT_PART(email_address, '@', 1), 
                    '.', ' '
                ), 
                '_', ' '
            )
        ),
        'User'
    );
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles to have default names based on email
UPDATE public.profiles 
SET name = get_default_name_from_email(email)
WHERE name IS NULL AND email IS NOT NULL;

-- Update the handle_new_user function to include name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email,
    get_default_name_from_email(NEW.email)
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(public.profiles.name, get_default_name_from_email(EXCLUDED.email));
  RETURN NEW;
END;
$$;