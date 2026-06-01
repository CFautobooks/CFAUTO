-- RecoverFlow Supabase schema
-- Run this in the Supabase SQL editor for a fresh project.

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
  role text not null default 'owner' check (role in ('owner', 'staff', 'admin')),
  plan text default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text,
  default_sender_name text,
  contact_email text,
  contact_phone text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  lifecycle_stage text not null default 'lead' check (lifecycle_stage in ('lead', 'quoted', 'customer', 'past_customer')),
  total_revenue_at_risk numeric(12,2) not null default 0,
  last_contacted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_up_sequences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  name text not null,
  trigger_rule jsonb not null default '{}',
  steps jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_up_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  sequence_id uuid references public.follow_up_sequences(id) on delete set null,
  case_type text not null check (case_type in ('invoice', 'quote', 'lead', 'appointment', 'repeat_service')),
  title text not null,
  source text not null default 'manual' check (
    source in ('manual', 'csv', 'gmail', 'outlook', 'quickbooks', 'stripe', 'square', 'calendly', 'hubspot', 'jobber', 'servicetitan', 'twilio')
  ),
  amount_cents integer not null default 0,
  currency text not null default 'AUD',
  due_date date,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  recovery_score numeric(5,2) not null default 0,
  status text not null default 'new' check (status in ('new', 'drafted', 'scheduled', 'sent', 'replied', 'recovered', 'paused', 'closed')),
  channel text not null default 'email' check (channel in ('email', 'sms', 'phone')),
  draft_subject text,
  draft_body text,
  sequence_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_up_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.follow_up_cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'phone')),
  subject text,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'queued', 'sent', 'failed', 'replied')),
  provider text check (provider in ('gmail', 'outlook', 'twilio')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.recovery_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.follow_up_cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('reply', 'payment', 'booking', 'manual_close')),
  amount_cents integer not null default 0,
  provider text,
  payload jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  provider text not null check (
    provider in ('gmail', 'outlook', 'quickbooks', 'stripe', 'square', 'calendly', 'hubspot', 'jobber', 'servicetitan', 'twilio')
  ),
  status text not null default 'not_connected' check (status in ('not_connected', 'connected', 'error', 'paused')),
  config jsonb not null default '{}',
  last_synced_at timestamptz,
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
    'customers',
    'follow_up_sequences',
    'follow_up_cases',
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
alter table public.customers enable row level security;
alter table public.follow_up_sequences enable row level security;
alter table public.follow_up_cases enable row level security;
alter table public.follow_up_messages enable row level security;
alter table public.recovery_events enable row level security;
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

drop policy if exists "businesses_crud_own" on public.businesses;
create policy "businesses_crud_own" on public.businesses
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "customers_crud_own" on public.customers;
create policy "customers_crud_own" on public.customers
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "follow_up_sequences_crud_own" on public.follow_up_sequences;
create policy "follow_up_sequences_crud_own" on public.follow_up_sequences
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "follow_up_cases_crud_own" on public.follow_up_cases;
create policy "follow_up_cases_crud_own" on public.follow_up_cases
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "follow_up_messages_crud_own" on public.follow_up_messages;
create policy "follow_up_messages_crud_own" on public.follow_up_messages
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "recovery_events_crud_own" on public.recovery_events;
create policy "recovery_events_crud_own" on public.recovery_events
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "integrations_crud_own" on public.integrations;
create policy "integrations_crud_own" on public.integrations
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create index if not exists follow_up_cases_user_status_idx on public.follow_up_cases(user_id, status);
create index if not exists follow_up_cases_next_follow_up_idx on public.follow_up_cases(next_follow_up_at);
create index if not exists follow_up_messages_case_idx on public.follow_up_messages(case_id);
create index if not exists recovery_events_case_idx on public.recovery_events(case_id);
