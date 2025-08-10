-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  parent_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  image_url text,
  image_path text,
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_author_id_profiles_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  sku character varying NOT NULL UNIQUE,
  barcode character varying,
  category_id uuid,
  unit_of_measure character varying DEFAULT 'pcs'::character varying,
  cost_price numeric NOT NULL DEFAULT 0,
  selling_price numeric NOT NULL DEFAULT 0,
  min_stock_level integer DEFAULT 0,
  max_stock_level integer,
  reorder_point integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  name text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.purchase_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  purchase_order_id uuid,
  product_id uuid,
  quantity integer NOT NULL,
  received_quantity integer DEFAULT 0,
  unit_cost numeric NOT NULL,
  total_cost numeric DEFAULT ((quantity)::numeric * unit_cost),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id),
  CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.purchase_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  po_number character varying NOT NULL UNIQUE,
  supplier_id uuid,
  store_id uuid,
  status character varying DEFAULT 'PENDING'::character varying,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date date,
  actual_delivery_date date,
  subtotal numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  notes text,
  created_by uuid,
  approved_by uuid,
  received_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT purchase_orders_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT purchase_orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT purchase_orders_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.profiles(id),
  CONSTRAINT purchase_orders_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.return_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  return_id uuid,
  product_id uuid,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric DEFAULT ((quantity)::numeric * unit_price),
  condition character varying DEFAULT 'GOOD'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT return_items_pkey PRIMARY KEY (id),
  CONSTRAINT return_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT return_items_return_id_fkey FOREIGN KEY (return_id) REFERENCES public.returns(id)
);
CREATE TABLE public.returns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  return_number character varying NOT NULL UNIQUE,
  sale_id uuid,
  store_id uuid,
  return_date date NOT NULL DEFAULT CURRENT_DATE,
  return_type character varying DEFAULT 'CUSTOMER'::character varying,
  total_amount numeric DEFAULT 0,
  refund_amount numeric DEFAULT 0,
  refund_method character varying,
  reason text,
  status character varying DEFAULT 'PENDING'::character varying,
  created_by uuid,
  approved_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT returns_pkey PRIMARY KEY (id),
  CONSTRAINT returns_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id),
  CONSTRAINT returns_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT returns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT returns_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.sale_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_id uuid,
  product_id uuid,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  total_price numeric DEFAULT (((quantity)::numeric * unit_price) - discount_amount),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT sale_items_pkey PRIMARY KEY (id),
  CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id)
);
CREATE TABLE public.sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_number character varying NOT NULL UNIQUE,
  store_id uuid,
  customer_name character varying,
  customer_phone character varying,
  customer_email character varying,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  subtotal numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  payment_method character varying,
  payment_status character varying DEFAULT 'PAID'::character varying,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT sales_pkey PRIMARY KEY (id),
  CONSTRAINT sales_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT sales_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.stock (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  store_id uuid,
  quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by uuid,
  CONSTRAINT stock_pkey PRIMARY KEY (id),
  CONSTRAINT stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT stock_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id),
  CONSTRAINT stock_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.stock_adjustment_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  adjustment_id uuid,
  product_id uuid,
  old_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  quantity_difference integer DEFAULT (new_quantity - old_quantity),
  unit_cost numeric NOT NULL,
  value_impact numeric DEFAULT (((new_quantity - old_quantity))::numeric * unit_cost),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT stock_adjustment_items_pkey PRIMARY KEY (id),
  CONSTRAINT stock_adjustment_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT stock_adjustment_items_adjustment_id_fkey FOREIGN KEY (adjustment_id) REFERENCES public.stock_adjustments(id)
);
CREATE TABLE public.stock_adjustments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  adjustment_number character varying NOT NULL UNIQUE,
  store_id uuid,
  adjustment_date date NOT NULL DEFAULT CURRENT_DATE,
  adjustment_type character varying NOT NULL,
  reason character varying,
  notes text,
  total_value_impact numeric DEFAULT 0,
  created_by uuid,
  approved_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id),
  CONSTRAINT stock_adjustments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT stock_adjustments_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id),
  CONSTRAINT stock_adjustments_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.stock_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  store_id uuid,
  movement_type character varying NOT NULL,
  quantity integer NOT NULL,
  reference_type character varying,
  reference_id uuid,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT stock_movements_pkey PRIMARY KEY (id),
  CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT stock_movements_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.stock_transfer_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transfer_id uuid,
  product_id uuid,
  quantity integer NOT NULL,
  received_quantity integer DEFAULT 0,
  unit_cost numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT stock_transfer_items_pkey PRIMARY KEY (id),
  CONSTRAINT stock_transfer_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT stock_transfer_items_transfer_id_fkey FOREIGN KEY (transfer_id) REFERENCES public.stock_transfers(id)
);
CREATE TABLE public.stock_transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transfer_number character varying NOT NULL UNIQUE,
  from_store_id uuid,
  to_store_id uuid,
  transfer_date date NOT NULL DEFAULT CURRENT_DATE,
  status character varying DEFAULT 'PENDING'::character varying,
  notes text,
  created_by uuid,
  approved_by uuid,
  received_by uuid,
  shipped_date date,
  received_date date,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT stock_transfers_pkey PRIMARY KEY (id),
  CONSTRAINT stock_transfers_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.profiles(id),
  CONSTRAINT stock_transfers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT stock_transfers_to_store_id_fkey FOREIGN KEY (to_store_id) REFERENCES public.stores(id),
  CONSTRAINT stock_transfers_from_store_id_fkey FOREIGN KEY (from_store_id) REFERENCES public.stores(id),
  CONSTRAINT stock_transfers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  location text,
  phone character varying,
  email character varying,
  manager_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT stores_pkey PRIMARY KEY (id),
  CONSTRAINT stores_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  contact_person character varying,
  email character varying,
  phone character varying,
  address text,
  tax_id character varying,
  payment_terms integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.task_assignees (
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  CONSTRAINT task_assignees_pkey PRIMARY KEY (task_id, user_id),
  CONSTRAINT task_assignees_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT task_assignees_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status = ANY (ARRAY['Todo'::text, 'In Progress'::text, 'Done'::text])),
  priority text NOT NULL CHECK (priority = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text])),
  due_date date,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_created_by_profiles_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role_id integer NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);