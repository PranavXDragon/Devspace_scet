-- Supabase Schema Updates for DevSpace Phase 1
-- Paste and execute this entirely in your Supabase SQL Editor

-- 1. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    constraints TEXT NOT NULL,
    time_limit_ms INTEGER DEFAULT 2000,
    memory_limit_kb INTEGER DEFAULT 256000,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Test Cases Table
CREATE TABLE IF NOT EXISTS public.test_cases (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    student_email TEXT NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', etc.
    runtime_ms INTEGER,
    memory_kb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Student Stats Table
CREATE TABLE IF NOT EXISTS public.student_stats (
    student_email TEXT PRIMARY KEY,
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    last_submission_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security (RLS) Policies
-- (For this phase, we will allow service_role to bypass RLS, 
-- but we can set up basic public read access for published questions)

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read for PUBLISHED questions
CREATE POLICY "Allow public read for published questions" 
ON public.questions 
FOR SELECT 
USING (status = 'Published');

-- We won't allow public read for test cases, submissions or stats yet, 
-- we will handle that via the backend service_role key.
