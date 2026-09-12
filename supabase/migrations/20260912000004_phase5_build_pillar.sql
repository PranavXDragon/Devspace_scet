-- DevSpace Phase 5: The Build Pillar (Projects & Teams)

-- 1. Extend student_registrations with GitHub username
ALTER TABLE student_registrations 
ADD COLUMN IF NOT EXISTS github_username VARCHAR(255);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    avatar_url VARCHAR(1024),
    created_by UUID NOT NULL REFERENCES student_registrations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Team Members Table (max 4 members per team will be enforced by application logic or a trigger)
CREATE TABLE IF NOT EXISTS team_members (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_registrations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'Member' CHECK (role IN ('Leader', 'Member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, student_id)
);

-- Ensure a student can only be in one team (Optional constraint, let's add it for simplicity. A student can only be in one team at a time for capstone/hackathons)
-- Actually, let's not enforce 1 team strictly at DB level in case they have multiple projects. Wait, for MVP, 1 team per student simplifies things.

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL, -- If null, it's a solo project
    student_id UUID REFERENCES student_registrations(id) ON DELETE SET NULL, -- The owner/uploader
    github_url VARCHAR(1024),
    live_url VARCHAR(1024),
    tags TEXT[],
    is_public BOOLEAN DEFAULT true, -- Student choice
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
