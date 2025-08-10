// Main types export - commonly used types for the frontend
// This file re-exports the most frequently used types for convenience

// Export all database types
export * from './database'

// Legacy exports for backward compatibility with existing code
export type {
  // Core entities
  Profile,
  ProductWithRelations as Product, // Use extended version
  StoreWithRelations as Store, // Use extended version
  Category,
  Supplier,
  Stock,
  
  // Sales & Returns
  SaleWithRelations as Sale, // Use extended version
  SaleItem,
  ReturnWithRelations as Return, // Use extended version
  ReturnItem,
  
  // Tasks
  TaskWithRelations as Task, // Use extended version
  TaskAssignee,
  Comment,
  
  // Stock Management
  StockMovement,
  StockAdjustmentWithRelations as StockAdjustment, // Use extended version
  StockAdjustmentItem,
  StockTransfer,
  StockTransferItem,
  
  // Purchase Orders
  PurchaseOrder,
  PurchaseOrderItem,
  
  // API Response Types
  ApiResponse,
  PaginatedResponse,
  ProductsResponse,
  SalesResponse,
  ReturnsResponse,
  StoresResponse,
  TasksResponse,
  
  // Analytics
  InventoryAnalytics,
  
  // Enums/Constants
  TaskStatus,
  TaskPriority,
  PaymentMethod,
  PaymentStatus,
  ReturnStatus,
  ReturnType,
  ReturnItemCondition,
  RefundMethod,
  StockMovementType,
  MovementReferenceType,
  PurchaseOrderStatus,
  AdjustmentType,
  TransferStatus,
  
  // Form types
  CreateProduct,
  UpdateProduct,
  CreateSale,
  CreateReturn,
  CreateStockAdjustment,
  
  // Base types
  Json
} from './database'

// Note: Removed backward compatibility exports to avoid circular references
// Database types are now available through the database.ts export