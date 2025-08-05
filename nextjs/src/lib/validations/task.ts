import { z } from 'zod'

export const TaskStatus = z.enum(['Todo', 'In Progress', 'Done'])
export const TaskPriority = z.enum(['Low', 'Medium', 'High'])

// Date preprocessing function to handle various date formats
const preprocessDate = (value: any) => {
  if (!value || value === '' || value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    // If it's already a valid ISO string, return it
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/)) {
      return value
    }
    // If it's a date string, convert to ISO
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
  }
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString()
  }
  return ''
}

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: TaskStatus.default('Todo'),
  priority: TaskPriority.default('Medium'),
  due_date: z.preprocess(preprocessDate, z.string().datetime().optional().or(z.literal(''))),
  assignees: z.array(z.string().uuid()).default([]),
})

export const UpdateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  due_date: z.preprocess(preprocessDate, z.string().datetime().optional().or(z.literal(''))),
  assignees: z.array(z.string().uuid()).optional(),
})

export const TaskQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: TaskStatus.or(z.literal('all')).default('all'),
  priority: TaskPriority.or(z.literal('all')).default('all'),
  assignee: z.string().uuid().optional(),
  due_from: z.string().datetime().optional(),
  due_to: z.string().datetime().optional(),
  sort: z.enum(['created_at', 'updated_at', 'due_date', 'title', 'priority', 'status']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const AssignTaskSchema = z.object({
  taskId: z.string().uuid(),
  userIds: z.array(z.string().uuid()),
})

export const DeleteTaskSchema = z.object({
  id: z.string().uuid(),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type TaskQueryInput = z.infer<typeof TaskQuerySchema>
export type AssignTaskInput = z.infer<typeof AssignTaskSchema>
export type DeleteTaskInput = z.infer<typeof DeleteTaskSchema>