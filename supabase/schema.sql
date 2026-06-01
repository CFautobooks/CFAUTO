-- CF AutoBooks Supabase schema
-- Run this in the Supabase SQL editor, then create a private storage bucket named "documents".

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'bookkeeper', 'admin')),
  plan text default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  abn text,
  gst_registered boolean not null default true,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  business_name text not null,
  contact_name text,
  email text,
  abn text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  file_name text not null,
  file_path text not null,
  mime_type text not null,
  file_size bigint not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'extracted', 'needs_review', 'approved', 'exported', 'failed')),
  extracted_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  gst_default boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  supplier_name text,
  supplier_abn text,
  invoice_number text,
  invoice_date date,
  due_date date,
  description text,
  category text,
  subtotal numeric(12,2) default 0,
  gst_amount numeric(12,2) default 0,
  total_amount numeric(12,2) default 0,
  currency text not null default 'AUD',
  confidence_score numeric(5,2) default 0,
  status text not null default 'uploaded' check (status in ('uploaded', 'extracted', 'needs_review', 'approved', 'exported')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transaction_line_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  quantity numeric(12,2),
  unit_price numeric(12,2),
  gst_amount numeric(12,2),
  total_amount numeric(12,2),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.extraction_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  transaction_id uuid references public.transactions(id) on delete set null,
  provider text not null default 'openai',
  status text not null check (status in ('success', 'failed')),
  extracted_text text,
  raw_response jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  provider text not null check (provider in ('myob', 'xero')),
  status text not null default 'coming_soon',
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, business_id, provider)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'businesses',
    'clients',
    'documents',
    'transactions',
    'integrations'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute procedure public.set_updated_at()', table_name, table_name);
  end loop;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.clients enable row level security;
alter table public.documents enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_line_items enable row level security;
alter table public.extraction_logs enable row level security;
alter table public.integrations enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid() or public.is_admin());

drop policy if exists "categories_read_authenticated" on public.categories;
create policy "categories_read_authenticated" on public.categories
  for select to authenticated using (true);

drop policy if exists "businesses_crud_own" on public.businesses;
create policy "businesses_crud_own" on public.businesses
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "clients_crud_own" on public.clients;
create policy "clients_crud_own" on public.clients
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "documents_crud_own" on public.documents;
create policy "documents_crud_own" on public.documents
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "transactions_crud_own" on public.transactions;
create policy "transactions_crud_own" on public.transactions
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "line_items_crud_own" on public.transaction_line_items;
create policy "line_items_crud_own" on public.transaction_line_items
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "extraction_logs_read_own_or_admin" on public.extraction_logs;
create policy "extraction_logs_read_own_or_admin" on public.extraction_logs
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "integrations_crud_own" on public.integrations;
create policy "integrations_crud_own" on public.integrations
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

insert into public.categories (name)
values
  ('Advertising and marketing'),
  ('Bank fees'),
  ('Cleaning'),
  ('Computer and software'),
  ('Contractors'),
  ('Equipment and tools'),
  ('Fuel and motor vehicle'),
  ('Insurance'),
  ('Meals and entertainment'),
  ('Office supplies'),
  ('Professional fees'),
  ('Rent'),
  ('Repairs and maintenance'),
  ('Telephone and internet'),
  ('Travel'),
  ('Utilities'),
  ('Other expenses')
on conflict (name) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "documents_storage_read_own" on storage.objects;
create policy "documents_storage_read_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documents_storage_insert_own" on storage.objects;
create policy "documents_storage_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documents_storage_update_own" on storage.objects;
create policy "documents_storage_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
