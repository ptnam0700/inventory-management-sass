-- Add image support to comments table
ALTER TABLE public.comments ADD COLUMN image_url TEXT;
ALTER TABLE public.comments ADD COLUMN image_path TEXT;

-- Create storage bucket for comment images (run this in Supabase dashboard SQL editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'comment-images', 
  'comment-images', 
  true, 
  5242880, -- 5MB limit (for free tier)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Set up RLS policies for comment images bucket
CREATE POLICY "Users can upload comment images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'comment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view comment images" ON storage.objects FOR SELECT 
USING (bucket_id = 'comment-images');

CREATE POLICY "Users can update their own comment images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'comment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own comment images" ON storage.objects FOR DELETE 
USING (bucket_id = 'comment-images' AND auth.uid()::text = (storage.foldername(name))[1]);