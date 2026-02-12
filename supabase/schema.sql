-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status') THEN
        CREATE TYPE client_status AS ENUM ('active', 'inactive');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_status') THEN
        CREATE TYPE vendor_status AS ENUM ('active', 'inactive');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status') THEN
        CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'expired', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bill_status') THEN
        CREATE TYPE bill_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'receipt_status') THEN
        CREATE TYPE receipt_status AS ENUM ('unused', 'partially_used', 'fully_used');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('unused', 'partially_used', 'fully_used');
    END IF;
END$$;

-- -----------------------------------------------------------------------------
-- 2. SALES MODULE TABLES
-- -----------------------------------------------------------------------------

-- Clients Table
create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  currency text default 'USD',
  status client_status default 'active',
  balance numeric default 0
);

-- Quotations Table
create table if not exists public.quotations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  client_id uuid references public.clients(id) not null,
  number text not null,
  date date not null,
  expiry_date date,
  status quote_status default 'draft',
  subtotal numeric default 0,
  tax_total numeric default 0,
  total numeric default 0,
  notes text
);

-- Invoices Table
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  client_id uuid references public.clients(id) not null,
  number text not null,
  date date not null,
  due_date date,
  status invoice_status default 'draft',
  subtotal numeric default 0,
  tax_total numeric default 0,
  total numeric default 0,
  balance_due numeric default 0,
  notes text
);

-- Payment Receipts Table (Money In)
create table if not exists public.payment_receipts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  client_id uuid references public.clients(id) not null,
  number text not null,
  date date not null,
  amount numeric not null,
  unused_amount numeric not null,
  payment_mode text,
  reference text,
  status receipt_status default 'unused',
  notes text
);

-- -----------------------------------------------------------------------------
-- 3. PURCHASE MODULE TABLES
-- -----------------------------------------------------------------------------

-- Vendors Table
create table if not exists public.vendors (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  currency text default 'USD',
  status vendor_status default 'active',
  balance numeric default 0
);

-- Purchase Orders Table
create table if not exists public.purchase_orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  vendor_id uuid references public.vendors(id) not null,
  number text not null,
  date date not null,
  expected_date date,
  status text default 'draft', -- simplified for now
  subtotal numeric default 0,
  tax_total numeric default 0,
  total numeric default 0,
  notes text
);

-- Bills Table (Vendor Invoices)
create table if not exists public.bills (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  vendor_id uuid references public.vendors(id) not null,
  number text not null,
  date date not null,
  due_date date,
  status bill_status default 'draft',
  subtotal numeric default 0,
  tax_total numeric default 0,
  total numeric default 0,
  balance_due numeric default 0,
  notes text
);

-- Payments Made Table (Money Out)
create table if not exists public.payments_made (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  vendor_id uuid references public.vendors(id) not null,
  number text not null,
  date date not null,
  amount numeric not null,
  unused_amount numeric not null,
  payment_mode text,
  reference text,
  status payment_status default 'unused',
  notes text
);

-- -----------------------------------------------------------------------------
-- 4. ITEMS TABLES (Line Items)
-- -----------------------------------------------------------------------------

create table if not exists public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  rate numeric default 0,
  amount numeric default 0
);

create table if not exists public.quotation_items (
  id uuid default uuid_generate_v4() primary key,
  quotation_id uuid references public.quotations(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  rate numeric default 0,
  amount numeric default 0
);

create table if not exists public.bill_items (
  id uuid default uuid_generate_v4() primary key,
  bill_id uuid references public.bills(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  rate numeric default 0,
  amount numeric default 0
);

create table if not exists public.purchase_order_items (
  id uuid default uuid_generate_v4() primary key,
  purchase_order_id uuid references public.purchase_orders(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  rate numeric default 0,
  amount numeric default 0
);

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
alter table public.clients enable row level security;
alter table public.quotations enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.vendors enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.bills enable row level security;
alter table public.payments_made enable row level security;
alter table public.invoice_items enable row level security;
alter table public.quotation_items enable row level security;
alter table public.bill_items enable row level security;
alter table public.purchase_order_items enable row level security;

-- Create Policies (Users can only see/edit their own data)
-- We drop existing policies first to ensure idempotency

-- Clients
drop policy if exists "Users can view their own clients" on clients;
create policy "Users can view their own clients" on clients for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own clients" on clients;
create policy "Users can insert their own clients" on clients for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own clients" on clients;
create policy "Users can update their own clients" on clients for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own clients" on clients;
create policy "Users can delete their own clients" on clients for delete using (auth.uid() = user_id);

-- Quotations
drop policy if exists "Users can view their own quotations" on quotations;
create policy "Users can view their own quotations" on quotations for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own quotations" on quotations;
create policy "Users can insert their own quotations" on quotations for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own quotations" on quotations;
create policy "Users can update their own quotations" on quotations for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own quotations" on quotations;
create policy "Users can delete their own quotations" on quotations for delete using (auth.uid() = user_id);

-- Invoices
drop policy if exists "Users can view their own invoices" on invoices;
create policy "Users can view their own invoices" on invoices for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own invoices" on invoices;
create policy "Users can insert their own invoices" on invoices for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own invoices" on invoices;
create policy "Users can update their own invoices" on invoices for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own invoices" on invoices;
create policy "Users can delete their own invoices" on invoices for delete using (auth.uid() = user_id);

-- Payment Receipts
drop policy if exists "Users can view their own receipts" on payment_receipts;
create policy "Users can view their own receipts" on payment_receipts for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own receipts" on payment_receipts;
create policy "Users can insert their own receipts" on payment_receipts for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own receipts" on payment_receipts;
create policy "Users can update their own receipts" on payment_receipts for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own receipts" on payment_receipts;
create policy "Users can delete their own receipts" on payment_receipts for delete using (auth.uid() = user_id);

-- Vendors
drop policy if exists "Users can view their own vendors" on vendors;
create policy "Users can view their own vendors" on vendors for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own vendors" on vendors;
create policy "Users can insert their own vendors" on vendors for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own vendors" on vendors;
create policy "Users can update their own vendors" on vendors for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own vendors" on vendors;
create policy "Users can delete their own vendors" on vendors for delete using (auth.uid() = user_id);

-- Purchase Orders
drop policy if exists "Users can view their own POs" on purchase_orders;
create policy "Users can view their own POs" on purchase_orders for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own POs" on purchase_orders;
create policy "Users can insert their own POs" on purchase_orders for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own POs" on purchase_orders;
create policy "Users can update their own POs" on purchase_orders for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own POs" on purchase_orders;
create policy "Users can delete their own POs" on purchase_orders for delete using (auth.uid() = user_id);

-- Bills
drop policy if exists "Users can view their own bills" on bills;
create policy "Users can view their own bills" on bills for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own bills" on bills;
create policy "Users can insert their own bills" on bills for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own bills" on bills;
create policy "Users can update their own bills" on bills for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own bills" on bills;
create policy "Users can delete their own bills" on bills for delete using (auth.uid() = user_id);

-- Payments Made
drop policy if exists "Users can view their own payments made" on payments_made;
create policy "Users can view their own payments made" on payments_made for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own payments made" on payments_made;
create policy "Users can insert their own payments made" on payments_made for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own payments made" on payments_made;
create policy "Users can update their own payments made" on payments_made for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own payments made" on payments_made;
create policy "Users can delete their own payments made" on payments_made for delete using (auth.uid() = user_id);

-- Items Policies
drop policy if exists "Users can view invoice items" on invoice_items;
create policy "Users can view invoice items" on invoice_items for select using (
  exists (select 1 from invoices where id = invoice_items.invoice_id and user_id = auth.uid())
);
drop policy if exists "Users can insert invoice items" on invoice_items;
create policy "Users can insert invoice items" on invoice_items for insert with check (
  exists (select 1 from invoices where id = invoice_items.invoice_id and user_id = auth.uid())
);
drop policy if exists "Users can update invoice items" on invoice_items;
create policy "Users can update invoice items" on invoice_items for update using (
  exists (select 1 from invoices where id = invoice_items.invoice_id and user_id = auth.uid())
);
drop policy if exists "Users can delete invoice items" on invoice_items;
create policy "Users can delete invoice items" on invoice_items for delete using (
  exists (select 1 from invoices where id = invoice_items.invoice_id and user_id = auth.uid())
);

drop policy if exists "Users can view quote items" on quotation_items;
create policy "Users can view quote items" on quotation_items for select using (
  exists (select 1 from quotations where id = quotation_items.quotation_id and user_id = auth.uid())
);
drop policy if exists "Users can insert quote items" on quotation_items;
create policy "Users can insert quote items" on quotation_items for insert with check (
  exists (select 1 from quotations where id = quotation_items.quotation_id and user_id = auth.uid())
);
drop policy if exists "Users can update quote items" on quotation_items;
create policy "Users can update quote items" on quotation_items for update using (
  exists (select 1 from quotations where id = quotation_items.quotation_id and user_id = auth.uid())
);
drop policy if exists "Users can delete quote items" on quotation_items;
create policy "Users can delete quote items" on quotation_items for delete using (
  exists (select 1 from quotations where id = quotation_items.quotation_id and user_id = auth.uid())
);

drop policy if exists "Users can view bill items" on bill_items;
create policy "Users can view bill items" on bill_items for select using (
  exists (select 1 from bills where id = bill_items.bill_id and user_id = auth.uid())
);
drop policy if exists "Users can insert bill items" on bill_items;
create policy "Users can insert bill items" on bill_items for insert with check (
  exists (select 1 from bills where id = bill_items.bill_id and user_id = auth.uid())
);
drop policy if exists "Users can update bill items" on bill_items;
create policy "Users can update bill items" on bill_items for update using (
  exists (select 1 from bills where id = bill_items.bill_id and user_id = auth.uid())
);
drop policy if exists "Users can delete bill items" on bill_items;
create policy "Users can delete bill items" on bill_items for delete using (
  exists (select 1 from bills where id = bill_items.bill_id and user_id = auth.uid())
);

drop policy if exists "Users can view PO items" on purchase_order_items;
create policy "Users can view PO items" on purchase_order_items for select using (
  exists (select 1 from purchase_orders where id = purchase_order_items.purchase_order_id and user_id = auth.uid())
);
drop policy if exists "Users can insert PO items" on purchase_order_items;
create policy "Users can insert PO items" on purchase_order_items for insert with check (
  exists (select 1 from purchase_orders where id = purchase_order_items.purchase_order_id and user_id = auth.uid())
);
drop policy if exists "Users can update PO items" on purchase_order_items;
create policy "Users can update PO items" on purchase_order_items for update using (
  exists (select 1 from purchase_orders where id = purchase_order_items.purchase_order_id and user_id = auth.uid())
);
drop policy if exists "Users can delete PO items" on purchase_order_items;
create policy "Users can delete PO items" on purchase_order_items for delete using (
  exists (select 1 from purchase_orders where id = purchase_order_items.purchase_order_id and user_id = auth.uid())
);

-- -----------------------------------------------------------------------------
-- 6. INVENTORY MODULE TABLES
-- -----------------------------------------------------------------------------

create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  sku text,
  unit_price numeric default 0,
  purchase_price numeric default 0,
  stock_quantity numeric default 0,
  category text,
  type text default 'goods', -- 'goods' or 'service'
  status text default 'active'
);

-- -----------------------------------------------------------------------------
-- 7. FINANCE MODULE TABLES
-- -----------------------------------------------------------------------------

-- Accounts (Chart of Accounts / Bank Accounts)
create table if not exists public.accounts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  name text not null,
  type text not null, -- 'bank', 'cash', 'credit', 'equity', 'income', 'expense'
  currency text default 'USD',
  balance numeric default 0,
  account_number text,
  bank_name text,
  status text default 'active'
);

-- Expenses
create table if not exists public.expenses (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  category text,
  amount numeric not null,
  date date not null,
  description text,
  vendor_id uuid references public.vendors(id),
  account_id uuid references public.accounts(id), -- Paid from this account
  reference text,
  receipt_url text,
  status text default 'paid'
);

-- Transactions (General Ledger / Journal Entries)
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  date date not null,
  description text not null,
  account_id uuid references public.accounts(id) not null,
  amount numeric not null,
  type text not null, -- 'debit' or 'credit'
  category text,
  reference_id uuid, -- Link to Invoice, Bill, Payment, etc.
  reference_type text -- 'invoice', 'bill', 'payment', etc.
);

-- -----------------------------------------------------------------------------
-- 8. RLS FOR NEW TABLES
-- -----------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.accounts enable row level security;
alter table public.expenses enable row level security;
alter table public.transactions enable row level security;

-- Products
drop policy if exists "Users can view their own products" on products;
create policy "Users can view their own products" on products for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own products" on products;
create policy "Users can insert their own products" on products for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own products" on products;
create policy "Users can update their own products" on products for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own products" on products;
create policy "Users can delete their own products" on products for delete using (auth.uid() = user_id);

-- Accounts
drop policy if exists "Users can view their own accounts" on accounts;
create policy "Users can view their own accounts" on accounts for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own accounts" on accounts;
create policy "Users can insert their own accounts" on accounts for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own accounts" on accounts;
create policy "Users can update their own accounts" on accounts for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own accounts" on accounts;
create policy "Users can delete their own accounts" on accounts for delete using (auth.uid() = user_id);

-- Expenses
drop policy if exists "Users can view their own expenses" on expenses;
create policy "Users can view their own expenses" on expenses for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own expenses" on expenses;
create policy "Users can insert their own expenses" on expenses for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own expenses" on expenses;
create policy "Users can update their own expenses" on expenses for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own expenses" on expenses;
create policy "Users can delete their own expenses" on expenses for delete using (auth.uid() = user_id);

-- Transactions
drop policy if exists "Users can view their own transactions" on transactions;
create policy "Users can view their own transactions" on transactions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own transactions" on transactions;
create policy "Users can insert their own transactions" on transactions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own transactions" on transactions;
create policy "Users can update their own transactions" on transactions for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own transactions" on transactions;
create policy "Users can delete their own transactions" on transactions for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. WAREHOUSE & STOCK MODULE
-- -----------------------------------------------------------------------------

create table if not exists public.warehouses (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  name text not null,
  location text,
  is_default boolean default false,
  status text default 'active'
);

create table if not exists public.stock_transfers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  reference text not null,
  date date not null,
  from_warehouse_id uuid references public.warehouses(id),
  to_warehouse_id uuid references public.warehouses(id),
  status text default 'draft', -- draft, in_transit, completed
  notes text
);

create table if not exists public.stock_transfer_items (
  id uuid default uuid_generate_v4() primary key,
  stock_transfer_id uuid references public.stock_transfers(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity numeric not null default 0
);

create table if not exists public.stock_adjustments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  reference text not null,
  date date not null,
  warehouse_id uuid references public.warehouses(id),
  reason text, -- Stocktake, Damaged, Theft, etc.
  status text default 'draft', -- draft, adjusted
  notes text
);

create table if not exists public.stock_adjustment_items (
  id uuid default uuid_generate_v4() primary key,
  stock_adjustment_id uuid references public.stock_adjustments(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity_change numeric not null default 0, -- negative for deduction, positive for addition
  current_stock numeric -- snapshot of stock at time of adjustment
);

-- -----------------------------------------------------------------------------
-- 10. ADDITIONAL SALES/PURCHASE DOCUMENTS
-- -----------------------------------------------------------------------------

-- Proforma Invoices
create table if not exists public.proforma_invoices (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  client_id uuid references public.clients(id) not null,
  number text not null,
  date date not null,
  expiry_date date,
  status text default 'draft', -- draft, sent, converted
  subtotal numeric default 0,
  tax_total numeric default 0,
  total numeric default 0,
  notes text
);

create table if not exists public.proforma_invoice_items (
  id uuid default uuid_generate_v4() primary key,
  proforma_invoice_id uuid references public.proforma_invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  rate numeric default 0,
  amount numeric default 0
);

-- Delivery Challans
create table if not exists public.delivery_challans (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  client_id uuid references public.clients(id) not null,
  number text not null,
  date date not null,
  reference text, -- e.g. Invoice Number or Order Number
  status text default 'draft', -- draft, delivered
  notes text
);

create table if not exists public.delivery_challan_items (
  id uuid default uuid_generate_v4() primary key,
  delivery_challan_id uuid references public.delivery_challans(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1
);

-- Credit Notes (Sales Return)
create table if not exists public.credit_notes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  client_id uuid references public.clients(id) not null,
  invoice_id uuid references public.invoices(id),
  number text not null,
  date date not null,
  amount numeric not null,
  reason text,
  status text default 'draft', -- draft, approved, refunded
  notes text
);

create table if not exists public.credit_note_items (
  id uuid default uuid_generate_v4() primary key,
  credit_note_id uuid references public.credit_notes(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  rate numeric default 0,
  amount numeric default 0
);

-- Debit Notes (Purchase Return)
create table if not exists public.debit_notes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  vendor_id uuid references public.vendors(id) not null,
  bill_id uuid references public.bills(id),
  number text not null,
  date date not null,
  amount numeric not null,
  reason text,
  status text default 'draft', -- draft, approved, refunded
  notes text
);

create table if not exists public.debit_note_items (
  id uuid default uuid_generate_v4() primary key,
  debit_note_id uuid references public.debit_notes(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  rate numeric default 0,
  amount numeric default 0
);

-- Sales Orders
create table if not exists public.sales_orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  client_id uuid references public.clients(id) not null,
  number text not null,
  date date not null,
  delivery_date date,
  status text default 'draft', -- draft, confirmed, shipped, cancelled
  subtotal numeric default 0,
  tax_total numeric default 0,
  total numeric default 0,
  notes text
);

create table if not exists public.sales_order_items (
  id uuid default uuid_generate_v4() primary key,
  sales_order_id uuid references public.sales_orders(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  rate numeric default 0,
  amount numeric default 0,
  unit text
);

-- -----------------------------------------------------------------------------
-- 11. RLS FOR NEW TABLES
-- -----------------------------------------------------------------------------

alter table public.warehouses enable row level security;
alter table public.stock_transfers enable row level security;
alter table public.stock_transfer_items enable row level security;
alter table public.stock_adjustments enable row level security;
alter table public.stock_adjustment_items enable row level security;
alter table public.proforma_invoices enable row level security;
alter table public.proforma_invoice_items enable row level security;
alter table public.delivery_challans enable row level security;
alter table public.delivery_challan_items enable row level security;
alter table public.credit_notes enable row level security;
alter table public.credit_note_items enable row level security;
alter table public.debit_notes enable row level security;
alter table public.debit_note_items enable row level security;

-- Policies for Warehouses
drop policy if exists "Users can view their own warehouses" on warehouses;
create policy "Users can view their own warehouses" on warehouses for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own warehouses" on warehouses;
create policy "Users can insert their own warehouses" on warehouses for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own warehouses" on warehouses;
create policy "Users can update their own warehouses" on warehouses for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own warehouses" on warehouses;
create policy "Users can delete their own warehouses" on warehouses for delete using (auth.uid() = user_id);

-- Policies for Stock Transfers
drop policy if exists "Users can view their own stock transfers" on stock_transfers;
create policy "Users can view their own stock transfers" on stock_transfers for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own stock transfers" on stock_transfers;
create policy "Users can insert their own stock transfers" on stock_transfers for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own stock transfers" on stock_transfers;
create policy "Users can update their own stock transfers" on stock_transfers for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own stock transfers" on stock_transfers;
create policy "Users can delete their own stock transfers" on stock_transfers for delete using (auth.uid() = user_id);

-- Policies for Stock Adjustments
drop policy if exists "Users can view their own stock adjustments" on stock_adjustments;
create policy "Users can view their own stock adjustments" on stock_adjustments for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own stock adjustments" on stock_adjustments;
create policy "Users can insert their own stock adjustments" on stock_adjustments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own stock adjustments" on stock_adjustments;
create policy "Users can update their own stock adjustments" on stock_adjustments for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own stock adjustments" on stock_adjustments;
create policy "Users can delete their own stock adjustments" on stock_adjustments for delete using (auth.uid() = user_id);

-- Policies for Proforma Invoices
drop policy if exists "Users can view their own proforma invoices" on proforma_invoices;
create policy "Users can view their own proforma invoices" on proforma_invoices for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own proforma invoices" on proforma_invoices;
create policy "Users can insert their own proforma invoices" on proforma_invoices for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own proforma invoices" on proforma_invoices;
create policy "Users can update their own proforma invoices" on proforma_invoices for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own proforma invoices" on proforma_invoices;
create policy "Users can delete their own proforma invoices" on proforma_invoices for delete using (auth.uid() = user_id);

-- Policies for Delivery Challans
drop policy if exists "Users can view their own delivery challans" on delivery_challans;
create policy "Users can view their own delivery challans" on delivery_challans for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own delivery challans" on delivery_challans;
create policy "Users can insert their own delivery challans" on delivery_challans for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own delivery challans" on delivery_challans;
create policy "Users can update their own delivery challans" on delivery_challans for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own delivery challans" on delivery_challans;
create policy "Users can delete their own delivery challans" on delivery_challans for delete using (auth.uid() = user_id);

-- Policies for Credit Notes
drop policy if exists "Users can view their own credit notes" on credit_notes;
create policy "Users can view their own credit notes" on credit_notes for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own credit notes" on credit_notes;
create policy "Users can insert their own credit notes" on credit_notes for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own credit notes" on credit_notes;
create policy "Users can update their own credit notes" on credit_notes for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own credit notes" on credit_notes;
create policy "Users can delete their own credit notes" on credit_notes for delete using (auth.uid() = user_id);

-- Policies for Debit Notes
drop policy if exists "Users can view their own debit notes" on debit_notes;
create policy "Users can view their own debit notes" on debit_notes for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own debit notes" on debit_notes;
create policy "Users can insert their own debit notes" on debit_notes for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own debit notes" on debit_notes;
create policy "Users can update their own debit notes" on debit_notes for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own debit notes" on debit_notes;
create policy "Users can delete their own debit notes" on debit_notes for delete using (auth.uid() = user_id);

-- Policies for Sales Orders
drop policy if exists "Users can view their own sales orders" on sales_orders;
create policy "Users can view their own sales orders" on sales_orders for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own sales orders" on sales_orders;
create policy "Users can insert their own sales orders" on sales_orders for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sales orders" on sales_orders;
create policy "Users can update their own sales orders" on sales_orders for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own sales orders" on sales_orders;
create policy "Users can delete their own sales orders" on sales_orders for delete using (auth.uid() = user_id);

-- Simple policies for items (allowing access if authenticated, could be stricter)
drop policy if exists "Users can view stock transfer items" on stock_transfer_items;
create policy "Users can view stock transfer items" on stock_transfer_items for select using (auth.role() = 'authenticated');

drop policy if exists "Users can insert stock transfer items" on stock_transfer_items;
create policy "Users can insert stock transfer items" on stock_transfer_items for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update stock transfer items" on stock_transfer_items;
create policy "Users can update stock transfer items" on stock_transfer_items for update using (auth.role() = 'authenticated');

drop policy if exists "Users can delete stock transfer items" on stock_transfer_items;
create policy "Users can delete stock transfer items" on stock_transfer_items for delete using (auth.role() = 'authenticated');

drop policy if exists "Users can view stock adjustment items" on stock_adjustment_items;
create policy "Users can view stock adjustment items" on stock_adjustment_items for select using (auth.role() = 'authenticated');

drop policy if exists "Users can insert stock adjustment items" on stock_adjustment_items;
create policy "Users can insert stock adjustment items" on stock_adjustment_items for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update stock adjustment items" on stock_adjustment_items;
create policy "Users can update stock adjustment items" on stock_adjustment_items for update using (auth.role() = 'authenticated');

drop policy if exists "Users can delete stock adjustment items" on stock_adjustment_items;
create policy "Users can delete stock adjustment items" on stock_adjustment_items for delete using (auth.role() = 'authenticated');

drop policy if exists "Users can view proforma invoice items" on proforma_invoice_items;
create policy "Users can view proforma invoice items" on proforma_invoice_items for select using (auth.role() = 'authenticated');

drop policy if exists "Users can insert proforma invoice items" on proforma_invoice_items;
create policy "Users can insert proforma invoice items" on proforma_invoice_items for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update proforma invoice items" on proforma_invoice_items;
create policy "Users can update proforma invoice items" on proforma_invoice_items for update using (auth.role() = 'authenticated');

drop policy if exists "Users can delete proforma invoice items" on proforma_invoice_items;
create policy "Users can delete proforma invoice items" on proforma_invoice_items for delete using (auth.role() = 'authenticated');

drop policy if exists "Users can view delivery challan items" on delivery_challan_items;
create policy "Users can view delivery challan items" on delivery_challan_items for select using (auth.role() = 'authenticated');

drop policy if exists "Users can insert delivery challan items" on delivery_challan_items;
create policy "Users can insert delivery challan items" on delivery_challan_items for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update delivery challan items" on delivery_challan_items;
create policy "Users can update delivery challan items" on delivery_challan_items for update using (auth.role() = 'authenticated');

drop policy if exists "Users can delete delivery challan items" on delivery_challan_items;
create policy "Users can delete delivery challan items" on delivery_challan_items for delete using (auth.role() = 'authenticated');

drop policy if exists "Users can view credit note items" on credit_note_items;
create policy "Users can view credit note items" on credit_note_items for select using (auth.role() = 'authenticated');

drop policy if exists "Users can insert credit note items" on credit_note_items;
create policy "Users can insert credit note items" on credit_note_items for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update credit note items" on credit_note_items;
create policy "Users can update credit note items" on credit_note_items for update using (auth.role() = 'authenticated');

drop policy if exists "Users can delete credit note items" on credit_note_items;
create policy "Users can delete credit note items" on credit_note_items for delete using (auth.role() = 'authenticated');

drop policy if exists "Users can view debit note items" on debit_note_items;
create policy "Users can view debit note items" on debit_note_items for select using (auth.role() = 'authenticated');

drop policy if exists "Users can insert debit note items" on debit_note_items;
create policy "Users can insert debit note items" on debit_note_items for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update debit note items" on debit_note_items;
create policy "Users can update debit note items" on debit_note_items for update using (auth.role() = 'authenticated');

drop policy if exists "Users can view sales order items" on sales_order_items;
create policy "Users can view sales order items" on sales_order_items for select using (auth.role() = 'authenticated');

drop policy if exists "Users can insert sales order items" on sales_order_items;
create policy "Users can insert sales order items" on sales_order_items for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update sales order items" on sales_order_items;
create policy "Users can update sales order items" on sales_order_items for update using (auth.role() = 'authenticated');

drop policy if exists "Users can delete sales order items" on sales_order_items;
create policy "Users can delete sales order items" on sales_order_items for delete using (auth.role() = 'authenticated');

drop policy if exists "Users can delete debit note items" on debit_note_items;
create policy "Users can delete debit note items" on debit_note_items for delete using (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 12. ALTERATIONS (UPDATES)
-- -----------------------------------------------------------------------------

-- Add missing columns to products if they don't exist
alter table public.products add column if not exists unit text default 'pcs';
alter table public.products add column if not exists reorder_point numeric default 0;

-- Add missing columns to accounts
alter table public.accounts add column if not exists code text;
alter table public.accounts add column if not exists description text;

-- Add missing columns to transactions
alter table public.transactions add column if not exists reference text;
