-- ==============================================================================
-- LIVE DATABASE PATCH
-- Run this script in your Supabase SQL Editor to fix the missing tables
-- that were skipped during the previous migrations due to name collisions.
-- ==============================================================================

-- 1. Create the correctly named project_team_members table
CREATE TABLE IF NOT EXISTS public.project_team_members (
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_registrations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'Member' CHECK (role IN ('Leader', 'Member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, student_id)
);

-- 2. Create the correctly named student_events table
CREATE TABLE IF NOT EXISTS public.student_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    type VARCHAR(50) DEFAULT 'Virtual' CHECK (type IN ('Virtual', 'In-Person', 'Hybrid')),
    image_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fix the event_rsvps table foreign key if it was created pointing to the wrong table
-- First, drop the existing table (it shouldn't have valid data yet since events failed)
DROP TABLE IF EXISTS public.event_rsvps;

CREATE TABLE public.event_rsvps (
    event_id UUID NOT NULL REFERENCES public.student_events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_registrations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, student_id)
);

-- 4. Enable Row Level Security (RLS) for the new tables
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Note: Our API connects using the service_role key, which bypasses RLS.
-- This lockdown simply protects the database from direct public connections.
