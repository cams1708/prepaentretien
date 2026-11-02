-- ============================================================================
-- 0001_init.sql
-- Prépa entretien ECM — schéma complet.
--
-- Reprend à l'identique la partie « prépa entretien » de la Plateforme des
-- Compétences :
-- - chat_conversations / chat_messages : même structure (kind, status,
--   metadata.summary pour le compte rendu de fin de session), même index
--   unique « une seule conversation active par étudiant·e et par type ».
-- - profiles : réduit aux seules informations que le coach utilise pour
--   personnaliser l'entretien (prénom, accroche, diplôme, année,
--   compétences, expériences).
-- - Rôles : student (inscription libre), staff (CREE / direction) et admin
--   — staff/admin consultent l'historique des sessions de tous les étudiants.
-- ============================================================================

create type public.user_role as enum ('student', 'staff', 'admin');
create type public.chat_conversation_kind as enum ('interview_prep');
create type public.chat_message_role as enum ('user', 'assistant');

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  first_name text not null default '',
  last_name text not null default '',
  email text not null,
  headline text,
  degree text,
  current_year text,
  skills text[] not null default '{}',
  experiences text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Un·e étudiant·e peut modifier son propre profil mais jamais son rôle ni
-- son email (le rôle staff/admin s'attribue uniquement depuis le SQL editor
-- de Supabase, voir README).
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and not public.is_staff_or_admin() then
    new.role := old.role;
    new.email := old.email;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Création automatique du profil à l'inscription (toujours en "student" :
-- le rôle n'est jamais lu depuis les métadonnées fournies par le client).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, first_name, last_name, email)
  values (
    new.id,
    'student',
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Conversations (identique à 0022_onboarding_chat.sql de la plateforme)
-- ----------------------------------------------------------------------------

create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  kind public.chat_conversation_kind not null,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chat_conversations_student_idx on public.chat_conversations (student_id, kind);

-- Au plus une conversation active par étudiant·e et par type.
create unique index chat_conversations_one_active_idx
  on public.chat_conversations (student_id, kind)
  where status = 'active';

create trigger chat_conversations_set_updated_at
  before update on public.chat_conversations
  for each row execute function public.set_updated_at();

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  role public.chat_message_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_conversation_idx on public.chat_messages (conversation_id, created_at);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users read their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Staff read all profiles"
  on public.profiles for select
  using (public.is_staff_or_admin());

create policy "Students manage their own conversations"
  on public.chat_conversations for all
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "Staff read all conversations"
  on public.chat_conversations for select
  using (public.is_staff_or_admin());

create policy "Students manage messages in their own conversations"
  on public.chat_messages for all
  using (
    exists (
      select 1 from public.chat_conversations cc
      where cc.id = conversation_id and cc.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.chat_conversations cc
      where cc.id = conversation_id and cc.student_id = auth.uid()
    )
  );

create policy "Staff read messages in any conversation"
  on public.chat_messages for select
  using (public.is_staff_or_admin());
