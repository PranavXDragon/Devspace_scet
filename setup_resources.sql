-- Supabase Schema Updates for DevSpace Phase 1.3 (Resources Module)
-- Paste and execute this entirely in your Supabase SQL Editor

-- 1. Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('DSA', 'Programming', 'Development', 'CS Core', 'Placement', 'Projects', 'Events', 'DevSpace Internal')),
    topic TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PDF', 'Video', 'Link', 'ZIP')),
    url TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
    tags TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    author TEXT,
    is_featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Resource Bookmarks Table
CREATE TABLE IF NOT EXISTS public.resource_bookmarks (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    student_email TEXT NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_email, resource_id)
);

-- Add Row Level Security (RLS) Policies
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;

-- Allow public read for PUBLISHED resources
CREATE POLICY "Allow public read for published resources" 
ON public.resources 
FOR SELECT 
USING (status = 'Published');

-- We won't allow public read for bookmarks yet, 
-- we will handle that via the backend service_role key.
