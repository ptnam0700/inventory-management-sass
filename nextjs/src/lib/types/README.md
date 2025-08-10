# TypeScript Types Documentation

This directory contains all TypeScript types for the Inventory Management System, generated from the actual database schema.

## File Structure

```
types/
├── database.ts     # Core database types matching SQL schema
├── index.ts        # Main export file with commonly used types
└── README.md       # This documentation file
```

## Usage

### Basic Import
```typescript
// Import all types
import { Product, Sale, Return, Store } from '@/lib/types'

// Import specific types
import type { ApiResponse, ProductsResponse } from '@/lib/types'
```

### Core Entity Types

#### Product Management
```typescript
import { Product, ProductWithRelations, CreateProduct } from '@/lib/types'

// Basic product type (matches database exactly)
const product: Product = {
  id: 'uuid',
  name: 'Product Name',
  sku: 'PROD-001',
  cost_price: 10.50,
  selling_price: 15.00,
  // ... other required fields
}

// Product with related data (for API responses)
const productWithStock: ProductWithRelations = {
  ...product,
  category: { /* Category data */ },
  stock: [{ /* Stock data */ }]
}

// For creating new products
const newProduct: CreateProduct = {
  name: 'New Product',
  sku: 'PROD-002',
  // ... omits id, created_at, updated_at
}
```

#### Sales Management
```typescript
import { Sale, SaleWithRelations, CreateSale } from '@/lib/types'

// Complete sale with items
const saleData: CreateSale = {
  invoice_number: 'INV-001',
  store_id: 'store-uuid',
  customer_name: 'John Doe',
  total_amount: 100.00,
  items: [
    {
      product_id: 'product-uuid',
      quantity: 2,
      unit_price: 50.00,
      discount_amount: 0
    }
  ]
}
```

#### API Responses
```typescript
import { ApiResponse, ProductsResponse } from '@/lib/types'

// Generic API response
const response: ApiResponse<Product> = {
  data: product,
  message: 'Product retrieved successfully'
}

// Paginated response
const productsResponse: ProductsResponse = {
  data: [product1, product2],
  totalCount: 100,
  totalPages: 10,
  currentPage: 1,
  hasNextPage: true,
  hasPreviousPage: false
}
```

## Type Categories

### 1. Core Database Types
These match the SQL schema exactly:
- `Product`, `Store`, `Category`, `Supplier`
- `Sale`, `SaleItem`, `Return`, `ReturnItem`
- `Stock`, `StockMovement`, `StockAdjustment`
- `Task`, `Comment`, `Profile`

### 2. Extended Types with Relations
Include related data for API responses:
- `ProductWithRelations`
- `SaleWithRelations`
- `TaskWithRelations`
- etc.

### 3. Form/Input Types
For creating and updating records:
- `CreateProduct`, `UpdateProduct`
- `CreateSale`, `CreateReturn`
- `CreateStockAdjustment`

### 4. Enum Types
String literal types for database constraints:
```typescript
type TaskStatus = 'Todo' | 'In Progress' | 'Done'
type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED'
type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
```

### 5. Response Types
API and pagination response types:
- `ApiResponse<T>`
- `PaginatedResponse<T>`
- `ProductsResponse`, `SalesResponse`, etc.

## Database Schema Mapping

The types are generated from the SQL schema in `/sql/table-schema.sql`. Key mappings:

| SQL Type | TypeScript Type | Notes |
|----------|----------------|-------|
| `uuid` | `string` | All UUIDs are strings |
| `character varying` | `string` | Text fields |
| `text` | `string \| null` | Optional text |
| `numeric` | `number` | Decimal numbers |
| `integer` | `number` | Whole numbers |
| `boolean` | `boolean` | True/false |
| `timestamp with time zone` | `string` | ISO date strings |
| `date` | `string` | Date strings (YYYY-MM-DD) |

## Best Practices

### 1. Use Specific Types
```typescript
// Good
const sale: Sale = { /* ... */ }

// Avoid
const sale: any = { /* ... */ }
```

### 2. Extended Types for Components
```typescript
// Use extended types for components that need related data
interface ProductListProps {
  products: ProductWithRelations[]
}

// Use basic types for database operations
const updateProduct = (id: string, data: UpdateProduct) => {
  // ...
}
```

### 3. Form Handling
```typescript
// Use Create/Update types for forms
const handleSubmit = (data: CreateProduct) => {
  // TypeScript ensures all required fields are present
}
```

### 4. API Responses
```typescript
// Always use ApiResponse wrapper
const createProduct = async (data: CreateProduct): Promise<ApiResponse<Product>> => {
  // ...
}
```

## Migration from Legacy Types

If you're updating from the old type system:

1. **Import from new location**: `@/lib/types` (same as before)
2. **Extended types**: Use `ProductWithRelations` instead of `Product` if you need related data
3. **Form types**: Use `CreateProduct`, `UpdateProduct` for forms
4. **Enums**: String literal types are now properly constrained

## Generating New Types

When the database schema changes:

1. Update `/sql/table-schema.sql` with the new schema
2. Regenerate types in `/src/lib/types/database.ts`
3. Update extended types and relations as needed
4. Run `npm run type-check` to verify all types are valid

## Type Safety Benefits

✅ **Database Schema Accuracy**: Types match the exact database structure
✅ **Null Safety**: Proper handling of nullable fields  
✅ **Enum Constraints**: String literals prevent invalid values
✅ **Relationship Clarity**: Extended types show what related data is available
✅ **Form Validation**: Create/Update types ensure required fields
✅ **API Consistency**: Standardized response formats