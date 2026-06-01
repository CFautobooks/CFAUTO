-- CallBack AI Supabase schema
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
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text,
  timezone text not null default 'UTC',
  main_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  auto_reply_enabled boolean not null default true,
  reply_after_missed_call boolean not null default true,
  reply_during_business_hours_only boolean not null default false,
  business_hours jsonb not null default '{}',
  after_hours_message text,
  emergency_keywords text[] not null default array['emergency', 'fire', 'smoke', 'unsafe'],
  ignored_keywords text[] not null default array['wrong number', 'spam'],
  max_ai_messages_per_conversation integer not null default 8 check (max_ai_messages_per_conversation between 1 and 20),
  owner_notification_phone text,
  owner_notification_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.phone_numbers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  phone_number text not null unique,
  label text,
  forwarding_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.missed_calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  caller_phone text not null,
  caller_name text,
  twilio_call_sid text unique,
  call_time timestamptz not null default now(),
  status text not null default 'received' check (status in ('received', 'ignored', 'auto_replied', 'converted')),
  auto_reply_sent boolean not null default false,
  ignored_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  missed_call_id uuid references public.missed_calls(id) on delete set null,
  caller_phone text not null,
  category text not null default 'unknown' check (category in ('new_lead', 'existing_customer', 'emergency', 'personal', 'spam', 'wrong_number', 'unknown')),
  status text not null default 'active' check (status in ('active', 'complete', 'stopped', 'escalated')),
  ai_summary text,
  confidence_score numeric(5,2) not null default 0,
  urgency text not null default 'medium' check (urgency in ('low', 'medium', 'high', 'emergency')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('caller', 'ai', 'owner', 'system')),
  sender_phone text,
  body text not null,
  twilio_message_sid text,
  direction text not null check (direction in ('inbound', 'outbound', 'internal')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  name text,
  phone text not null,
  enquiry_type text,
  job_description text,
  urgency text not null default 'medium' check (urgency in ('low', 'medium', 'high', 'emergency')),
  address text,
  preferred_callback_time text,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'quoted', 'won', 'lost', 'spam', 'personal', 'wrong_number', 'emergency')),
  estimated_value numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  contact_type text not null default 'customer' check (contact_type in ('customer', 'staff', 'family', 'vendor', 'other')),
  notes text,
  auto_reply_allowed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table if not exists public.blocked_numbers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  phone text not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table if not exists public.ai_prompts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  system_prompt text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  channel text not null check (channel in ('sms', 'email')),
  recipient text not null,
  body text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  plan text not null default 'starter' check (plan in ('starter', 'growth', 'pro')),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'cancelled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
    'business_settings',
    'phone_numbers',
    'conversations',
    'leads',
    'contacts',
    'ai_prompts',
    'subscriptions'
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

create or replace function public.user_can_access_business(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.businesses
    where id = target_business_id and owner_id = auth.uid()
  ) or public.is_admin();
$$;

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_settings enable row level security;
alter table public.phone_numbers enable row level security;
alter table public.missed_calls enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.leads enable row level security;
alter table public.contacts enable row level security;
alter table public.blocked_numbers enable row level security;
alter table public.ai_prompts enable row level security;
alter table public.notification_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid() or public.is_admin());

drop policy if exists "businesses_crud_owner_or_admin" on public.businesses;
create policy "businesses_crud_owner_or_admin" on public.businesses
  for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "business_settings_crud_business_owner" on public.business_settings;
create policy "business_settings_crud_business_owner" on public.business_settings
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

drop policy if exists "phone_numbers_crud_business_owner" on public.phone_numbers;
create policy "phone_numbers_crud_business_owner" on public.phone_numbers
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

drop policy if exists "missed_calls_crud_business_owner" on public.missed_calls;
create policy "missed_calls_crud_business_owner" on public.missed_calls
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

drop policy if exists "conversations_crud_business_owner" on public.conversations;
create policy "conversations_crud_business_owner" on public.conversations
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

drop policy if exists "messages_crud_conversation_owner" on public.messages;
create policy "messages_crud_conversation_owner" on public.messages
  for all using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and public.user_can_access_business(conversations.business_id)
    )
  ) with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and public.user_can_access_business(conversations.business_id)
    )
  );

drop policy if exists "leads_crud_business_owner" on public.leads;
create policy "leads_crud_business_owner" on public.leads
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

drop policy if exists "contacts_crud_business_owner" on public.contacts;
create policy "contacts_crud_business_owner" on public.contacts
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

drop policy if exists "blocked_numbers_crud_business_owner" on public.blocked_numbers;
create policy "blocked_numbers_crud_business_owner" on public.blocked_numbers
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

drop policy if exists "ai_prompts_crud_business_owner" on public.ai_prompts;
create policy "ai_prompts_crud_business_owner" on public.ai_prompts
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

drop policy if exists "notification_logs_crud_business_owner" on public.notification_logs;
create policy "notification_logs_crud_business_owner" on public.notification_logs
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

drop policy if exists "audit_logs_read_business_owner" on public.audit_logs;
create policy "audit_logs_read_business_owner" on public.audit_logs
  for select using (business_id is null or public.user_can_access_business(business_id));

drop policy if exists "audit_logs_insert_business_owner" on public.audit_logs;
create policy "audit_logs_insert_business_owner" on public.audit_logs
  for insert with check (business_id is null or public.user_can_access_business(business_id));

drop policy if exists "subscriptions_crud_business_owner" on public.subscriptions;
create policy "subscriptions_crud_business_owner" on public.subscriptions
  for all using (public.user_can_access_business(business_id)) with check (public.user_can_access_business(business_id));

create index if not exists phone_numbers_phone_number_idx on public.phone_numbers(phone_number);
create index if not exists missed_calls_business_created_idx on public.missed_calls(business_id, created_at desc);
create index if not exists conversations_business_status_idx on public.conversations(business_id, status);
create index if not exists conversations_caller_phone_idx on public.conversations(caller_phone);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists leads_business_status_idx on public.leads(business_id, status);
create index if not exists contacts_business_phone_idx on public.contacts(business_id, phone);
create index if not exists blocked_numbers_business_phone_idx on public.blocked_numbers(business_id, phone);
