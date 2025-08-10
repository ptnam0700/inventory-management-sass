// Database Types - Generated from SQL Schema
// This file contains TypeScript types that match the exact database schema

// Base JSON type
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ===== ENUMS AND CONSTANTS =====

// Task Management
export type TaskStatus = 'Todo' | 'In Progress' | 'Done'
export type TaskPriority = 'Low' | 'Medium' | 'High'

// Stock Management
export type StockMovementType = 'IN' | 'OUT'
export type MovementReferenceType = 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER'

// Purchase Orders
export type PurchaseOrderStatus = 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED'

// Sales
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER'
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED'

// Returns
export type ReturnType = 'CUSTOMER' | 'SUPPLIER' | 'DAMAGED'
export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
export type RefundMethod = 'CASH' | 'CARD' | 'CREDIT' | 'EXCHANGE'
export type ReturnItemCondition = 'GOOD' | 'DAMAGED' | 'DEFECTIVE'

// Stock Adjustments
export type AdjustmentType = 'INCREASE' | 'DECREASE' | 'RECOUNT'

// Stock Transfers
export type TransferStatus = 'PENDING' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED'

// ===== CORE TABLES =====

// Profiles (Users)
export interface Profile {
  id: string
  email: string | null
  name: string | null
}

// User Roles System
export interface UserRole {
  user_id: string
  role_id: number
}

// Task Management
export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null // date
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export interface TaskAssignee {
  task_id: string
  user_id: string
}

export interface Comment {
  id: string
  task_id: string
  author_id: string
  content: string
  created_at: string | null
  image_url: string | null
  image_path: string | null
}

// ===== INVENTORY MANAGEMENT =====

// Categories
export interface Category {
  id: string
  name: string
  description: string | null
  parent_id: string | null
  created_at: string
  updated_at: string
}

// Suppliers
export interface Supplier {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  tax_id: string | null
  payment_terms: number // default 30
  is_active: boolean // default true
  created_at: string
  updated_at: string
}

// Stores
export interface Store {
  id: string
  name: string
  location: string | null
  phone: string | null
  email: string | null
  manager_id: string | null
  is_active: boolean // default true
  created_at: string
  updated_at: string
}

// Products
export interface Product {
  id: string
  name: string
  description: string | null
  sku: string // unique
  barcode: string | null
  category_id: string | null
  unit_of_measure: string // default 'pcs'
  cost_price: number // default 0
  selling_price: number // default 0
  min_stock_level: number // default 0
  max_stock_level: number | null
  reorder_point: number // default 0
  is_active: boolean // default true
  created_by: string | null
  created_at: string
  updated_at: string
}

// Stock
export interface Stock {
  id: string
  product_id: string | null
  store_id: string | null
  quantity: number // default 0
  reserved_quantity: number // default 0
  last_updated: string
  updated_by: string | null
}

// Stock Movements (Audit Trail)
export interface StockMovement {
  id: string
  product_id: string | null
  store_id: string | null
  movement_type: string // 'IN' or 'OUT'
  quantity: number
  reference_type: string | null // 'SALE', 'PURCHASE', 'ADJUSTMENT', etc.
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

// ===== PURCHASE MANAGEMENT =====

// Purchase Orders
export interface PurchaseOrder {
  id: string
  po_number: string // unique
  supplier_id: string | null
  store_id: string | null
  status: string // default 'PENDING'
  order_date: string // date, default CURRENT_DATE
  expected_delivery_date: string | null // date
  actual_delivery_date: string | null // date
  subtotal: number // default 0
  tax_amount: number // default 0
  discount_amount: number // default 0
  shipping_cost: number // default 0
  total_amount: number // default 0
  notes: string | null
  created_by: string | null
  approved_by: string | null
  received_by: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string | null
  product_id: string | null
  quantity: number
  received_quantity: number // default 0
  unit_cost: number
  total_cost: number // calculated: quantity * unit_cost
  created_at: string
}

// ===== SALES MANAGEMENT =====

// Sales
export interface Sale {
  id: string
  invoice_number: string // unique
  store_id: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  sale_date: string // date, default CURRENT_DATE
  subtotal: number // default 0
  tax_amount: number // default 0
  discount_amount: number // default 0
  total_amount: number // default 0
  payment_method: string | null
  payment_status: string // default 'PAID'
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SaleItem {
  id: string
  sale_id: string | null
  product_id: string | null
  quantity: number
  unit_price: number
  discount_amount: number // default 0
  total_price: number // calculated: (quantity * unit_price) - discount_amount
  created_at: string
}

// ===== RETURNS MANAGEMENT =====

// Returns
export interface Return {
  id: string
  return_number: string // unique
  sale_id: string | null
  store_id: string | null
  return_date: string // date, default CURRENT_DATE
  return_type: string // default 'CUSTOMER'
  total_amount: number // default 0
  refund_amount: number // default 0
  refund_method: string | null
  reason: string | null
  status: string // default 'PENDING'
  created_by: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface ReturnItem {
  id: string
  return_id: string | null
  product_id: string | null
  quantity: number
  unit_price: number
  total_price: number // calculated: quantity * unit_price
  condition: string // default 'GOOD'
  created_at: string
}

// ===== STOCK ADJUSTMENTS =====

// Stock Adjustments
export interface StockAdjustment {
  id: string
  adjustment_number: string // unique
  store_id: string | null
  adjustment_date: string // date, default CURRENT_DATE
  adjustment_type: string // required
  reason: string | null
  notes: string | null
  total_value_impact: number // default 0
  created_by: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface StockAdjustmentItem {
  id: string
  adjustment_id: string | null
  product_id: string | null
  old_quantity: number
  new_quantity: number
  quantity_difference: number // calculated: new_quantity - old_quantity
  unit_cost: number
  value_impact: number // calculated: quantity_difference * unit_cost
  created_at: string
}

// ===== STOCK TRANSFERS =====

// Stock Transfers
export interface StockTransfer {
  id: string
  transfer_number: string // unique
  from_store_id: string | null
  to_store_id: string | null
  transfer_date: string // date, default CURRENT_DATE
  status: string // default 'PENDING'
  notes: string | null
  created_by: string | null
  approved_by: string | null
  received_by: string | null
  shipped_date: string | null // date
  received_date: string | null // date
  created_at: string
  updated_at: string
}

export interface StockTransferItem {
  id: string
  transfer_id: string | null
  product_id: string | null
  quantity: number
  received_quantity: number // default 0
  unit_cost: number
  created_at: string
}

// ===== EXTENDED TYPES WITH RELATIONS =====

// Extended types that include related data (for API responses)
export interface ProductWithRelations extends Product {
  category?: Category
  created_by_profile?: Profile
  stock?: Stock[]
}

export interface StoreWithRelations extends Store {
  manager?: Profile
}

export interface SaleWithRelations extends Sale {
  store?: Store
  created_by_profile?: Profile
  sale_items?: (SaleItem & { product?: Product })[]
}

export interface ReturnWithRelations extends Return {
  sale?: Sale
  store?: Store
  created_by_profile?: Profile
  approved_by_profile?: Profile
  return_items?: (ReturnItem & { product?: Product })[]
}

export interface TaskWithRelations extends Task {
  created_by_profile?: Profile
  task_assignees?: (TaskAssignee & { profiles?: Profile })[]
  comments?: (Comment & { profiles?: Profile })[]
}

export interface StockAdjustmentWithRelations extends StockAdjustment {
  store?: Store
  created_by_profile?: Profile
  approved_by_profile?: Profile
  stock_adjustment_items?: (StockAdjustmentItem & { product?: Product })[]
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse {
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

// Specific paginated response types
export interface ProductsResponse extends PaginatedResponse {
  products: ProductWithRelations[]
}

export interface SalesResponse extends PaginatedResponse {
  sales: SaleWithRelations[]
}

export interface ReturnsResponse extends PaginatedResponse {
  returns: ReturnWithRelations[]
}

export interface StoresResponse extends PaginatedResponse {
  stores: StoreWithRelations[]
}

export interface TasksResponse extends PaginatedResponse {
  data: TaskWithRelations[]
}

export interface AdjustmentsResponse extends PaginatedResponse {
  adjustments: StockAdjustmentWithRelations[]
}

// ===== ANALYTICS TYPES =====

export interface InventoryAnalytics {
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

// ===== FORM/INPUT TYPES =====

// Create/Update types (for forms)
export type CreateProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type UpdateProduct = Partial<CreateProduct>

export type CreateSale = Omit<Sale, 'id' | 'created_at' | 'updated_at'> & {
  items: Omit<SaleItem, 'id' | 'sale_id' | 'created_at'>[]
}

export type CreateReturn = Omit<Return, 'id' | 'created_at' | 'updated_at'> & {
  items: Omit<ReturnItem, 'id' | 'return_id' | 'created_at'>[]
}

export type CreateStockAdjustment = Omit<StockAdjustment, 'id' | 'created_at' | 'updated_at'> & {
  items: Omit<StockAdjustmentItem, 'id' | 'adjustment_id' | 'created_at'>[]
}