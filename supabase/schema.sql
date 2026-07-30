-- ConvoPilot Supabase Schema Definition
-- Run this in your Supabase SQL Editor

-- 1. Enable pgvector extension for future semantic matching (Part 2)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Key Points Table (linked to a contact)
CREATE TABLE IF NOT EXISTS public.key_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    covered BOOLEAN DEFAULT FALSE,
    embedding vector(1536), -- For OpenAI text-embedding-3-small in Part 2
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Todos Table (can optionally link to a contact)
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_key_points_contact_id ON public.key_points(contact_id);
CREATE INDEX IF NOT EXISTS idx_todos_contact_id ON public.todos(contact_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON public.todos(completed);

-- Updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_key_points_updated_at ON public.key_points;
CREATE TRIGGER update_key_points_updated_at
BEFORE UPDATE ON public.key_points
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_todos_updated_at ON public.todos;
CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON public.todos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Permissive for public API / standard app usage
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write access to contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to key_points" ON public.key_points FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to todos" ON public.todos FOR ALL USING (true) WITH CHECK (true);
