# Inventory Management System - Architecture & Flow Documentation

## System Overview

This is a **multi-store inventory management system** that tracks products, stock levels, sales, returns, and adjustments across multiple store locations. The system automatically manages inventory levels through transactions and provides comprehensive analytics.

## Key Concepts

### Multi-Store Architecture
- **Centralized Product Catalog**: Products are defined globally but stock is tracked per store
- **Store-Specific Stock**: Each product can have different quantities at different stores
- **Unified Reporting**: Analytics aggregate data across all stores while maintaining store-level visibility

### Inventory Flow Architecture
The system follows a **transaction-based inventory management** approach where every stock change is:
1. **Recorded** as a stock movement for audit trail
2. **Applied** to the actual stock levels
3. **Tracked** for analytics and reporting

## Core Database Tables

### Master Data
- **`stores`**: Store locations with contact info and managers
- **`products`**: Global product catalog with pricing and stock level settings
- **`categories`**: Product categorization hierarchy
- **`suppliers`**: Vendor information for procurement

### Inventory Management
- **`stock`**: Current inventory levels per product per store
- **`stock_movements`**: Complete audit trail of all inventory changes
- **`stock_adjustments`**: Manual inventory corrections (cycle counts, damage, theft)
- **`stock_adjustment_items`**: Line items for adjustments

### Transactions
- **`sales`**: Sales transactions with customer info
- **`sale_items`**: Products sold in each transaction
- **`returns`**: Return transactions (customer, supplier, damaged goods)
- **`return_items`**: Products returned with condition tracking

## Inventory Management Flow

### 🛍️ Sales Flow
```
1. Sale Created → 2. Stock Reduced → 3. Movement Recorded
```

**Detailed Process:**
1. **Create Sale** (`POST /api/sales`)
   - Sale record created with customer info and totals
   - Sale items created with product details

2. **Stock Impact** (Automatic)
   - Stock quantity **decreased** for each product sold
   - Uses `update_stock_quantity()` database function
   - Stock levels updated per store

3. **Audit Trail**
   - `stock_movements` record created with:
     - `movement_type: 'OUT'`
     - `reference_type: 'SALE'`
     - `reference_id: sale.id`

**Code Implementation:**
```typescript
// In sales/route.ts - Lines 212-240
for (const item of items) {
  // Update stock (decrease)
  await supabase.rpc('update_stock_quantity', {
    p_product_id: item.product_id,
    p_store_id: store_id,
    p_quantity_change: -item.quantity
  })
  
  // Create movement record
  await supabase.from('stock_movements').insert({
    movement_type: 'OUT',
    reference_type: 'SALE',
    reference_id: sale.id
  })
}
```

### 🔄 Returns Flow
```
1. Return Created → 2. Stock Adjusted → 3. Movement Recorded
```

**Detailed Process:**
1. **Create Return** (`POST /api/returns`)
   - Return record created with reason and status
   - Return items created with condition assessment

2. **Stock Impact** (Conditional)
   - **GOOD condition items**: Stock increased (return to sellable inventory)
   - **DAMAGED/DEFECTIVE items**: Stock NOT increased (write-off)
   - Only applies when status is `APPROVED` or `COMPLETED`

3. **Audit Trail**
   - Movement type depends on item condition:
     - Good items: `movement_type: 'IN'`
     - Damaged items: `movement_type: 'OUT'` (permanent removal)

**Code Implementation:**
```typescript
// In returns/route.ts - Lines 208-242
if (status === 'APPROVED' || status === 'COMPLETED') {
  for (const item of items) {
    // Only good items return to stock
    if (item.condition === 'GOOD') {
      await supabase.rpc('update_stock_quantity', {
        p_quantity_change: item.quantity // Positive = increase
      })
    }
    
    // Always record movement
    await supabase.from('stock_movements').insert({
      movement_type: item.condition === 'GOOD' ? 'IN' : 'OUT',
      reference_type: 'RETURN',
      notes: `Return - ${item.condition}`
    })
  }
}
```

### 📊 Stock Adjustments Flow
```
1. Adjustment Created → 2. Stock Updated → 3. Movement Recorded
```

**Detailed Process:**
1. **Create Adjustment** (`POST /api/stock-adjustments`)
   - Manual stock correction (physical count, damage, theft, etc.)
   - Records old quantity, new quantity, and reason

2. **Stock Impact** (Direct)
   - Stock quantity **directly set** to new quantity
   - Calculates value impact based on cost price

3. **Audit Trail**
   - Movement direction based on quantity change:
     - Increase: `movement_type: 'IN'`
     - Decrease: `movement_type: 'OUT'`

**Code Implementation:**
```typescript
// In stock-adjustments/route.ts - Lines 207-247
// Direct stock update (not delta-based)
await supabase.from('stock').upsert({
  product_id,
  store_id,
  quantity: new_quantity, // Set exact quantity
  last_updated: new Date()
})

// Record movement for difference
if (quantityDifference !== 0) {
  await supabase.from('stock_movements').insert({
    movement_type: quantityDifference > 0 ? 'IN' : 'OUT',
    quantity: Math.abs(quantityDifference),
    reference_type: 'ADJUSTMENT'
  })
}
```

## Database Architecture Features

### Automatic Stock Management
- **Database Functions**: `update_stock_quantity()` handles stock updates
- **Triggers**: Automatically update stock when movements are inserted
- **Constraints**: Unique constraint on `(product_id, store_id)` in stock table

### Audit Trail
- **Complete History**: Every stock change recorded in `stock_movements`
- **Reference Tracking**: Links movements to original transactions
- **User Tracking**: Records who made each change

### Data Integrity
- **Transactions**: Sales/Returns operations are atomic
- **Rollback Support**: Failed operations clean up created records
- **Validation**: API validates required fields and stock availability

## Analytics & Reporting

### Real-Time Metrics
- **Current Stock Levels**: Live view across all stores
- **Stock Movements**: Daily in/out activity tracking
- **Sales Performance**: Revenue and profit calculations
- **Inventory Health**: Low stock and out-of-stock alerts

### Multi-Store Insights
- **Store Performance**: Sales and inventory by location
- **Product Performance**: Top sellers across all stores
- **Stock Distribution**: Inventory levels per store

## API Endpoints

### Inventory Management
- `GET/POST /api/products` - Product catalog management
- `GET/POST /api/stores` - Store location management
- `GET/POST /api/sales` - Sales transaction processing
- `GET/POST /api/returns` - Return processing
- `GET/POST /api/stock-adjustments` - Manual stock corrections

### Analytics
- `GET /api/analytics` - Comprehensive inventory and sales analytics

## UI Components

### Pages
- `/app/stores` - Store management with CRUD operations
- `/app/inventory` - Product and stock level management
- `/app/sales` - Sales transaction management
- `/app/returns` - Return processing
- `/app/analytics` - Business intelligence dashboard

### Key Features
- **Real-time Updates**: Stock levels update immediately after transactions
- **Multi-store Views**: Filter data by store location
- **Search & Filtering**: Find products, sales, returns across all data
- **Responsive Design**: Works on desktop and mobile devices

## Development Guidelines

### When Building New Features

1. **Follow Transaction Pattern**
   ```typescript
   // 1. Create main record
   const record = await supabase.from('table').insert(data)
   
   // 2. Update stock if needed
   await supabase.rpc('update_stock_quantity', params)
   
   // 3. Create movement record
   await supabase.from('stock_movements').insert(movement)
   ```

2. **Handle Errors Gracefully**
   - Rollback main records if sub-operations fail
   - Log errors for debugging
   - Return meaningful error messages

3. **Maintain Audit Trail**
   - Always create stock movement records
   - Include reference to original transaction
   - Record user who made the change

### Testing Stock Operations
- **Check Stock Levels**: Verify quantities after operations
- **Verify Movements**: Ensure movement records are created
- **Test Edge Cases**: Zero stock, negative adjustments, etc.
- **Multi-store Scenarios**: Test operations across different stores

## Security Considerations

- **User Authentication**: All operations require valid user session
- **Store Access Control**: Users can only access authorized stores
- **Audit Logging**: All changes tracked with user identification
- **Data Validation**: Prevent invalid stock operations

## Performance Optimization

- **Indexed Queries**: Database indexes on frequently queried fields
- **Aggregated Analytics**: Pre-calculated metrics for dashboard
- **Paginated Results**: Large datasets split into manageable chunks
- **Caching Strategy**: Analytics data cached with auto-refresh

---

## Quick Reference

### Common Operations
- **Create Sale**: Automatically reduces stock and creates movements
- **Process Return**: Conditionally adds stock back based on item condition
- **Adjust Stock**: Directly sets stock levels with audit trail
- **View Analytics**: Real-time dashboard with multi-store insights

### Key Database Functions
- `update_stock_quantity(product_id, store_id, change)` - Update stock levels
- Triggers automatically handle stock updates from movements
- All timestamp fields auto-update on record changes

This system provides a robust, auditable inventory management solution suitable for multi-location retail operations.