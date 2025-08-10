-- Auto-update updated_at column for tasks table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tasks table
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inventory Management Triggers

-- Update updated_at column triggers for all inventory tables
DROP TRIGGER IF EXISTS update_stores_updated_at ON public.stores;
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON public.purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_returns_updated_at ON public.returns;
CREATE TRIGGER update_returns_updated_at
    BEFORE UPDATE ON public.returns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stock_adjustments_updated_at ON public.stock_adjustments;
CREATE TRIGGER update_stock_adjustments_updated_at
    BEFORE UPDATE ON public.stock_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stock_transfers_updated_at ON public.stock_transfers;
CREATE TRIGGER update_stock_transfers_updated_at
    BEFORE UPDATE ON public.stock_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update stock quantity
CREATE OR REPLACE FUNCTION update_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock quantity based on stock movement
    IF TG_OP = 'INSERT' THEN
        -- Insert or update stock record
        INSERT INTO public.stock (product_id, store_id, quantity, last_updated, updated_by)
        VALUES (NEW.product_id, NEW.store_id, 
                CASE 
                    WHEN NEW.movement_type = 'IN' THEN NEW.quantity
                    WHEN NEW.movement_type = 'OUT' THEN -NEW.quantity
                    ELSE NEW.quantity
                END,
                CURRENT_TIMESTAMP, NEW.created_by)
        ON CONFLICT (product_id, store_id)
        DO UPDATE SET 
            quantity = public.stock.quantity + 
                CASE 
                    WHEN NEW.movement_type = 'IN' THEN NEW.quantity
                    WHEN NEW.movement_type = 'OUT' THEN -NEW.quantity
                    ELSE NEW.quantity
                END,
            last_updated = CURRENT_TIMESTAMP,
            updated_by = NEW.created_by;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to automatically update stock when stock movements are inserted
DROP TRIGGER IF EXISTS update_stock_on_movement ON public.stock_movements;
CREATE TRIGGER update_stock_on_movement
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW EXECUTE FUNCTION update_stock_quantity();

-- Function to update stock when purchase order is received
CREATE OR REPLACE FUNCTION update_stock_from_purchase()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status != 'RECEIVED' AND NEW.status = 'RECEIVED' THEN
        -- Create stock movements for all items in the purchase order
        INSERT INTO public.stock_movements (
            product_id, store_id, movement_type, quantity,
            reference_type, reference_id, created_by, created_at
        )
        SELECT 
            poi.product_id, po.store_id, 'IN', poi.received_quantity,
            'PURCHASE', po.id, po.received_by, CURRENT_TIMESTAMP
        FROM public.purchase_order_items poi
        JOIN public.purchase_orders po ON poi.purchase_order_id = po.id
        WHERE po.id = NEW.id AND poi.received_quantity > 0;
        
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update stock when purchase orders are marked as received
DROP TRIGGER IF EXISTS update_stock_from_purchase_trigger ON public.purchase_orders;
CREATE TRIGGER update_stock_from_purchase_trigger
    AFTER UPDATE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_stock_from_purchase();

-- Function to manually update stock quantity (for API calls)
CREATE OR REPLACE FUNCTION update_stock_quantity(
    p_product_id UUID,
    p_store_id UUID,
    p_quantity_change INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- Insert or update stock record
    INSERT INTO public.stock (product_id, store_id, quantity, last_updated)
    VALUES (p_product_id, p_store_id, p_quantity_change, CURRENT_TIMESTAMP)
    ON CONFLICT (product_id, store_id)
    DO UPDATE SET 
        quantity = public.stock.quantity + p_quantity_change,
        last_updated = CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';