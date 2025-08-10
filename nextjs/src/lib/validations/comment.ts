import { z } from 'zod'

export const CreateCommentSchema = z.object({
  task_id: z.string().uuid(),
  content: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
  image_url: z.string().optional(),
  image_path: z.string().optional(),
}).refine(data => {
  // At least content or image must be provided
  const hasContent = data.content && data.content.trim().length > 0;
  const hasImage = data.image_url && data.image_url.trim().length > 0;
  return hasContent || hasImage;
}, {
  message: 'Either comment text or an image is required',
})

export const UpdateCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
  image_url: z.string().optional(),
  image_path: z.string().optional(),
}).refine(data => {
  // At least content or image must be provided
  const hasContent = data.content && data.content.trim().length > 0;
  const hasImage = data.image_url && data.image_url.trim().length > 0;
  return hasContent || hasImage;
}, {
  message: 'Either comment text or an image is required',
})

export const DeleteCommentSchema = z.object({
  id: z.string().uuid(),
})

export const GetCommentsSchema = z.object({
  task_id: z.string().uuid(),
})

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>
export type DeleteCommentInput = z.infer<typeof DeleteCommentSchema>
export type GetCommentsInput = z.infer<typeof GetCommentsSchema>