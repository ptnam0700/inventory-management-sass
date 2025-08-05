import { z } from 'zod'

export const CreateCommentSchema = z.object({
  task_id: z.string().uuid(),
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
})

export const UpdateCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
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