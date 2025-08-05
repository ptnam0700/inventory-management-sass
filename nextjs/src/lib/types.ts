export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TaskStatus = 'Todo' | 'In Progress' | 'Done'
export type TaskPriority = 'Low' | 'Medium' | 'High'

export type Profile = {
  id: string
  email: string | null
  name: string | null
}

export type TaskAssignee = {
  user_id: string
  task_id: string
  profiles?: Profile
}

export type Comment = {
  id: string
  task_id: string
  author_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  task_assignees?: TaskAssignee[]
  comments?: Comment[]
}

export type TasksResponse = {
  tasks: Task[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export type ApiResponse<T = any> = {
  data?: T
  error?: string
  message?: string
}

export type PaginationMeta = {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      roles: {
        Row: { id: number; name: string }
        Insert: { id?: number; name: string }
        Update: { id?: number; name?: string }
        Relationships: []
      }
      user_roles: {
        Row: { user_id: string; role_id: number }
        Insert: { user_id: string; role_id: number }
        Update: { user_id?: string; role_id?: number }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: TaskStatus
          priority: TaskPriority
          due_date: Date | string | null
          created_by: string | null
          created_at: string
          updated_at: string
          task_assignees: TaskAssignee[]
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          due_date?: Date | string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id: string
          title?: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          due_date?: Date | string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_assignees: {
        Row: { task_id: string; user_id: string }
        Insert: { task_id: string; user_id: string }
        Update: { task_id?: string; user_id?: string }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          task_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          author_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database['public']

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never


