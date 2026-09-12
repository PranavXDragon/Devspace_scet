-- DevSpace Phase 4: Coding Challenges & Gamification



-- 2. Challenges Table (Daily/Weekly/Custom)
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    problem_id UUID NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    reward_points INTEGER DEFAULT 0,
    type VARCHAR(50) DEFAULT 'daily', -- 'daily', 'weekly', 'custom'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contests Table
CREATE TABLE IF NOT EXISTS contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER, -- If null, it's open for the entire duration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Contest Problems (Mapping table)
CREATE TABLE IF NOT EXISTS contest_problems (
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES coding_problems(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 100,
    PRIMARY KEY (contest_id, problem_id)
);

-- 5. Student Stats (Gamification profile)
CREATE TABLE IF NOT EXISTS student_stats (
    student_id UUID PRIMARY KEY REFERENCES student_registrations(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    rank_tier VARCHAR(50) DEFAULT 'Bronze',
    last_submission_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Challenge Completions (To track which challenges a student has finished and avoid duplicate rewards)
CREATE TABLE IF NOT EXISTS challenge_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_registrations(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    points_awarded INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, challenge_id)
);

-- Create a View for Leaderboard to make querying easier (joins student profile with stats)
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    ss.student_id,
    sr.name,
    sr.email,
    sr.course,
    sr.year,
    sr.section,
    ss.total_points,
    ss.current_streak,
    ss.max_streak,
    ss.rank_tier,
    ss.last_submission_date
FROM 
    student_stats ss
JOIN 
    student_registrations sr ON ss.student_id = sr.id
ORDER BY 
    ss.total_points DESC, ss.max_streak DESC;
