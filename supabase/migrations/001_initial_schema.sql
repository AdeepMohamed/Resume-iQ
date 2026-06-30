-- ============================================================
-- ResumeIQ AI – Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- Profiles (extends auth.users)
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  avatar_url    text,
  openai_api_key text,          -- user-supplied key (stored encrypted via RLS)
  analyses_count integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- Resumes
-- ────────────────────────────────────────────────────────────
create table public.resumes (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  file_name     text not null,
  file_type     text not null,       -- 'pdf' | 'docx'
  raw_text      text not null,
  created_at    timestamptz default now()
);

alter table public.resumes enable row level security;

create policy "Users can manage their own resumes"
  on public.resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- Analyses
-- ────────────────────────────────────────────────────────────
create table public.analyses (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  resume_id           uuid references public.resumes(id) on delete set null,
  job_description     text,
  ats_score           integer,
  overall_grade       text,
  summary             text,
  strengths           jsonb default '[]',
  weaknesses          jsonb default '[]',
  missing_skills      jsonb default '[]',
  keywords_found      jsonb default '[]',
  keywords_missing    jsonb default '[]',
  suggestions         jsonb default '[]',
  raw_response        jsonb,
  created_at          timestamptz default now()
);

alter table public.analyses enable row level security;

create policy "Users can manage their own analyses"
  on public.analyses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- Cover Letters
-- ────────────────────────────────────────────────────────────
create table public.cover_letters (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  analysis_id     uuid references public.analyses(id) on delete set null,
  job_description text,
  tone            text default 'professional',
  content         text not null,
  created_at      timestamptz default now()
);

alter table public.cover_letters enable row level security;

create policy "Users can manage their own cover letters"
  on public.cover_letters for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- Interview Questions
-- ────────────────────────────────────────────────────────────
create table public.interview_questions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  analysis_id     uuid references public.analyses(id) on delete set null,
  job_description text,
  questions       jsonb not null default '[]',
  created_at      timestamptz default now()
);

alter table public.interview_questions enable row level security;

create policy "Users can manage their own interview questions"
  on public.interview_questions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────
create index idx_resumes_user_id on public.resumes(user_id);
create index idx_analyses_user_id on public.analyses(user_id);
create index idx_analyses_created_at on public.analyses(created_at desc);
create index idx_cover_letters_user_id on public.cover_letters(user_id);
create index idx_interview_questions_user_id on public.interview_questions(user_id);
