# Task Comment Image Upload Setup

This document outlines the image upload functionality that has been implemented for task comments.

## Features Implemented

✅ **Image Upload Support**
- Users can attach images to task comments
- **Images can be posted without text** (text is optional)
- Drag & drop or click to select images
- File size limit: 5MB (optimized for Supabase free tier)
- Supported formats: JPG, JPEG, PNG, GIF, WebP

✅ **Storage & Security**
- Images stored in Supabase Storage bucket: `comment-images`
- Row Level Security (RLS) policies implemented
- User can only upload/delete their own images
- Images organized by user ID and task ID

✅ **UI/UX Features**  
- Collapsible image upload section
- Image preview with click to view full size
- Delete button for image owners (appears on hover)
- Loading states for upload and delete operations
- Comprehensive error handling and validation

## Database Changes

The following SQL migration has been created but needs to be run in your Supabase dashboard:

**File**: `sql/add_comment_images.sql`

```sql
-- Add image support to comments table
ALTER TABLE public.comments ADD COLUMN image_url TEXT;
ALTER TABLE public.comments ADD COLUMN image_path TEXT;

-- Create storage bucket for comment images
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
```

## Installation Steps

### 1. Database Setup
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from `sql/add_comment_images.sql`
3. Run the migration to create the storage bucket and add columns

### 2. Install Required Dependencies
Run this command to install the required Radix UI component:

```bash
npm install @radix-ui/react-collapsible
```

### 3. Next.js Configuration
The `next.config.ts` has been updated to allow images from Supabase storage. If you see any image loading issues, restart your development server:

```bash
npm run dev
```

### 4. Verify Setup
1. Start your development server: `npm run dev`
2. Navigate to a task and open the comments dialog
3. Try uploading an image using the "Attach Image" button
4. Verify the image displays correctly and can be deleted

## File Structure

### New Files Created
- `src/lib/utils/image-validation.ts` - Image validation utilities
- `src/components/ui/image-upload.tsx` - Reusable image upload component
- `src/components/ui/collapsible.tsx` - Collapsible UI component
- `src/app/api/comments/[id]/image/route.ts` - Image deletion API
- `sql/add_comment_images.sql` - Database migration

### Modified Files
- `src/lib/types.ts` - Updated Comment type and Database schema
- `src/lib/validations/comment.ts` - Added image field validation
- `src/app/app/tasks/task-comments-dialog.tsx` - Added image upload UI
- `src/app/app/tasks/hooks/use-comments.ts` - Updated to handle image data
- `src/app/api/tasks/[id]/comments/route.ts` - Updated API to handle images
- `src/lib/supabase/unified.ts` - Updated createComment method

## Storage Optimization for Free Tier

The implementation is optimized for Supabase free tier (1GB storage):

- **File Size Limit**: 5MB per image (conservative limit)
- **Storage Structure**: `{userId}/{taskId}/{timestamp}_{filename}` 
- **Cleanup**: Delete functionality removes files from storage
- **Validation**: Client and server-side validation prevents invalid uploads

## Usage

### For Users
1. Open any task comments dialog
2. **Option 1: Text + Image Comment**
   - Type your comment in the text area
   - Click "Attach Image" to add an image
   - Click "Post Comment"
3. **Option 2: Image-Only Comment**
   - Leave the text area empty
   - Click "Attach Image" to expand the upload section
   - Drag & drop an image or click to select
   - Click "Post Comment" (text is optional)
4. Hover over your uploaded images to see the delete button

### For Developers
The image upload system is fully modular and reusable:

```typescript
import { ImageUpload } from '@/components/ui/image-upload'
import { validateImageFile } from '@/lib/utils/image-validation'

// Use in any component
<ImageUpload
  selectedImage={file}
  onImageSelect={setFile}
  onImageRemove={() => setFile(null)}
  isUploading={uploading}
/>
```

## Security Considerations

- ✅ File type validation (images only)
- ✅ File size limits (5MB max)
- ✅ User authentication required
- ✅ Users can only delete their own images
- ✅ RLS policies prevent unauthorized access
- ✅ Image paths are structured to prevent conflicts

## Troubleshooting

### Common Issues

1. **"Failed to upload image" Error**
   - Check that the Supabase storage bucket was created
   - Verify RLS policies are in place
   - Ensure user is authenticated

2. **Images not displaying**
   - Check that the bucket is set to `public: true`
   - Verify the image URL is accessible
   - Check browser network tab for CORS issues

3. **"File too large" Error**
   - Images must be under 5MB
   - Consider compressing images before upload
   - Check the bucket file_size_limit setting

### Upgrade Path to Pro Tier

When ready to upgrade to Supabase Pro:

1. Increase `IMAGE_CONFIG.MAX_SIZE` in `image-validation.ts`
2. Update bucket `file_size_limit` in Supabase dashboard
3. Consider implementing image compression/resizing
4. Add support for additional file types if needed

## Future Enhancements

Potential improvements for future versions:
- Image compression before upload
- Multiple image support per comment  
- Image editing capabilities (crop, rotate)
- Thumbnail generation
- Alternative storage providers (AWS S3, etc.)
- Image gallery view for tasks