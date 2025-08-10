-- Performance indexes for task management

-- Index for task filtering by status (most common filter)
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Index for task filtering by priority
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

-- Index for task filtering by created_by (user's own tasks)
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);

-- Index for task sorting by created_at (default sort)
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- Index for task sorting by due_date
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date) WHERE due_date IS NOT NULL;

-- Composite index for assignee filtering (task_assignees join optimization)
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON public.task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON public.task_assignees(task_id);

-- Index for comments by task_id (for task detail view)
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON public.comments(task_id);

-- Index for comments sorting by created_at
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- Full-text search indexes for title and description
-- Using GIN index for better text search performance
CREATE INDEX IF NOT EXISTS idx_tasks_title_search ON public.tasks USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_tasks_description_search ON public.tasks USING GIN(to_tsvector('english', COALESCE(description, '')));

-- Composite index for common query patterns (status + created_at for list views)
CREATE INDEX IF NOT EXISTS idx_tasks_status_created_at ON public.tasks(status, created_at DESC);

-- Index for user profiles (used in assignee lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Inventory Management Indexes

-- Stores indexes
CREATE INDEX IF NOT EXISTS idx_stores_manager_id ON public.stores(manager_id);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON public.stores(is_active);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON public.suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON public.suppliers(email);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

-- Stock indexes
CREATE INDEX IF NOT EXISTS idx_stock_product_id ON public.stock(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_store_id ON public.stock(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_last_updated ON public.stock(last_updated);
CREATE INDEX IF NOT EXISTS idx_stock_quantity ON public.stock(quantity);

-- Stock movements indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_store_id ON public.stock_movements(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_type ON public.stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_type ON public.stock_movements(reference_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_id ON public.stock_movements(reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_by ON public.stock_movements(created_by);

-- Purchase orders indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON public.purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_store_id ON public.purchase_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON public.purchase_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders(created_by);

-- Purchase order items indexes
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON public.purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON public.purchase_order_items(product_id);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON public.sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_store_id ON public.sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON public.sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON public.sales(created_by);
CREATE INDEX IF NOT EXISTS idx_sales_customer_phone ON public.sales(customer_phone);

-- Sale items indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);

-- Returns indexes
CREATE INDEX IF NOT EXISTS idx_returns_return_number ON public.returns(return_number);
CREATE INDEX IF NOT EXISTS idx_returns_sale_id ON public.returns(sale_id);
CREATE INDEX IF NOT EXISTS idx_returns_store_id ON public.returns(store_id);
CREATE INDEX IF NOT EXISTS idx_returns_return_date ON public.returns(return_date DESC);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_created_by ON public.returns(created_by);

-- Return items indexes
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON public.return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_return_items_product_id ON public.return_items(product_id);

-- Stock adjustments indexes
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_adjustment_number ON public.stock_adjustments(adjustment_number);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_store_id ON public.stock_adjustments(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_adjustment_date ON public.stock_adjustments(adjustment_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created_by ON public.stock_adjustments(created_by);

-- Stock adjustment items indexes
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_items_adjustment_id ON public.stock_adjustment_items(adjustment_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_items_product_id ON public.stock_adjustment_items(product_id);

-- Stock transfers indexes
CREATE INDEX IF NOT EXISTS idx_stock_transfers_transfer_number ON public.stock_transfers(transfer_number);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_from_store_id ON public.stock_transfers(from_store_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_to_store_id ON public.stock_transfers(to_store_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_status ON public.stock_transfers(status);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_created_by ON public.stock_transfers(created_by);

-- Stock transfer items indexes
CREATE INDEX IF NOT EXISTS idx_stock_transfer_items_transfer_id ON public.stock_transfer_items(transfer_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_items_product_id ON public.stock_transfer_items(product_id);