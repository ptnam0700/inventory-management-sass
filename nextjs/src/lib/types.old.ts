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
  image_url?: string
  image_path?: string
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

export type ApiResponse<T = unknown> = {
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
          image_url?: string
          image_path?: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          author_id: string
          content: string
          image_url?: string
          image_path?: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          author_id?: string
          content?: string
          image_url?: string
          image_path?: string
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

// Re-export new structured types for backward compatibility
export * from './types/database'

// Keep legacy Database type for Supabase compatibility
// Note: Database type should be imported from the structured types instead

// Legacy Store type (replaced by new structured types)
export type StoreLegacy = {
  id: string
  name: string
  location?: string
  phone?: string
  email?: string
  manager_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export type Category = {
  id: string
  name: string
  description?: string
  parent_id?: string
  created_at: string
  updated_at: string
  parent_category?: Category
  sub_categories?: Category[]
}

export type Supplier = {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  tax_id?: string
  payment_terms: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  category_id?: string
  unit_of_measure: string
  cost_price: number
  selling_price: number
  min_stock_level: number
  max_stock_level?: number
  reorder_point: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
  category?: Category
  profiles?: Profile
  stock?: Stock[]
}

export type Stock = {
  id: string
  product_id: string
  store_id: string
  quantity: number
  reserved_quantity: number
  last_updated: string
  updated_by?: string
  product?: Product
  store?: { id: string; name: string; location?: string }
  profiles?: Profile
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER'
export type MovementReferenceType = 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER'

export type StockMovement = {
  id: string
  product_id: string
  store_id: string
  movement_type: StockMovementType
  quantity: number
  reference_type?: MovementReferenceType
  reference_id?: string
  notes?: string
  created_by?: string
  created_at: string
  product?: Product
  store?: { id: string; name: string; location?: string }
  profiles?: Profile
}

export type PurchaseOrderStatus = 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED'

export type PurchaseOrder = {
  id: string
  po_number: string
  supplier_id?: string
  store_id?: string
  status: PurchaseOrderStatus
  order_date: string
  expected_delivery_date?: string
  actual_delivery_date?: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  notes?: string
  created_by?: string
  approved_by?: string
  received_by?: string
  created_at: string
  updated_at: string
  supplier?: Supplier
  store?: { id: string; name: string; location?: string }
  purchase_order_items?: PurchaseOrderItem[]
  created_by_profile?: Profile
  approved_by_profile?: Profile
  received_by_profile?: Profile
}

export type PurchaseOrderItem = {
  id: string
  purchase_order_id: string
  product_id?: string
  quantity: number
  received_quantity: number
  unit_cost: number
  total_cost: number
  created_at: string
  product?: Product
}

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER'
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED'

export type Sale = {
  id: string
  invoice_number: string
  store_id?: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  sale_date: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method?: PaymentMethod
  payment_status: PaymentStatus
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
  store?: { id: string; name: string; location?: string }
  sale_items?: SaleItem[]
  profiles?: Profile
}

export type SaleItem = {
  id: string
  sale_id: string
  product_id?: string
  quantity: number
  unit_price: number
  discount_amount: number
  total_price: number
  created_at: string
  product?: Product
}

export type ReturnType = 'CUSTOMER' | 'SUPPLIER' | 'DAMAGED'
export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
export type RefundMethod = 'CASH' | 'CARD' | 'CREDIT' | 'EXCHANGE'

export type Return = {
  id: string
  return_number: string
  sale_id?: string
  store_id?: string
  return_date: string
  return_type: ReturnType
  total_amount: number
  refund_amount: number
  refund_method?: RefundMethod
  reason?: string
  status: ReturnStatus
  created_by?: string
  approved_by?: string
  created_at: string
  updated_at: string
  sale?: Sale
  store?: { id: string; name: string; location?: string }
  return_items?: ReturnItem[]
  created_by_profile?: Profile
  approved_by_profile?: Profile
}

export type ReturnItemCondition = 'GOOD' | 'DAMAGED' | 'DEFECTIVE'

export type ReturnItem = {
  id: string
  return_id: string
  product_id?: string
  quantity: number
  unit_price: number
  total_price: number
  condition: ReturnItemCondition
  created_at: string
  product?: Product
}

export type AdjustmentType = 'INCREASE' | 'DECREASE' | 'RECOUNT'
export type AdjustmentReason = 'PHYSICAL_COUNT' | 'DAMAGE' | 'THEFT' | 'EXPIRED' | 'OTHER'

export type StockAdjustment = {
  id: string
  adjustment_number: string
  store_id?: string
  adjustment_date: string
  adjustment_type: AdjustmentType
  reason?: AdjustmentReason
  notes?: string
  total_value_impact: number
  created_by?: string
  approved_by?: string
  created_at: string
  updated_at: string
  store?: { id: string; name: string; location?: string }
  stock_adjustment_items?: StockAdjustmentItem[]
  created_by_profile?: Profile
  approved_by_profile?: Profile
}

export type StockAdjustmentItem = {
  id: string
  adjustment_id: string
  product_id?: string
  old_quantity: number
  new_quantity: number
  quantity_difference: number
  unit_cost: number
  value_impact: number
  created_at: string
  product?: Product
}

export type TransferStatus = 'PENDING' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED'

export type StockTransfer = {
  id: string
  transfer_number: string
  from_store_id?: string
  to_store_id?: string
  transfer_date: string
  status: TransferStatus
  notes?: string
  created_by?: string
  approved_by?: string
  received_by?: string
  shipped_date?: string
  received_date?: string
  created_at: string
  updated_at: string
  from_store?: { id: string; name: string; location?: string }
  to_store?: { id: string; name: string; location?: string }
  stock_transfer_items?: StockTransferItem[]
  created_by_profile?: Profile
  approved_by_profile?: Profile
  received_by_profile?: Profile
}

export type StockTransferItem = {
  id: string
  transfer_id: string
  product_id?: string
  quantity: number
  received_quantity: number
  unit_cost: number
  created_at: string
  product?: Product
}

// Analytics Types
export type InventoryAnalytics = {
  total_products: number
  total_stock_value: number
  low_stock_products: number
  out_of_stock_products: number
  total_sales_today: number
  total_sales_this_month: number
  total_purchases_this_month: number
  profit_this_month: number
  top_selling_products: Array<{
    product: Product
    quantity_sold: number
    revenue: number
  }>
  stock_movements_summary: Array<{
    date: string
    in_movements: number
    out_movements: number
  }>
}

// API Response Types for Inventory
export type StoresResponse = {
  stores: { id: string; name: string; location?: string }[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export type ProductsResponse = {
  products: Product[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export type SalesResponse = {
  sales: Sale[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export type PurchaseOrdersResponse = {
  purchase_orders: PurchaseOrder[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export type ReturnsResponse = {
  returns: Return[]
  totalCount: number
  totalPages: number
  currentPage: number
}


