-- DevSpace Phase 7: The Progress & Career Pillar

-- 1. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(1024),
    required_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Achievements
CREATE TABLE IF NOT EXISTS student_achievements (
    student_id UUID NOT NULL REFERENCES student_registrations(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, achievement_id)
);

-- 3. Opportunities (Job Board)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'Full-Time' CHECK (type IN ('Internship', 'Full-Time', 'Part-Time', 'Contract')),
    location VARCHAR(255),
    apply_url VARCHAR(1024) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial achievements
INSERT INTO achievements (title, description, required_points, icon_url)
VALUES 
    ('First Steps', 'Solve your first problem on DevSpace.', 10, 'https://api.dicebear.com/7.x/shapes/svg?seed=FirstSteps'),
    ('Problem Solver', 'Earn 100 points from solving coding challenges.', 100, 'https://api.dicebear.com/7.x/shapes/svg?seed=ProblemSolver'),
    ('Code Master', 'Earn 500 points from solving coding challenges.', 500, 'https://api.dicebear.com/7.x/shapes/svg?seed=CodeMaster')
ON CONFLICT DO NOTHING;

-- Seed some mock opportunities
INSERT INTO opportunities (title, company, type, location, apply_url)
VALUES
    ('Software Engineering Intern', 'Google', 'Internship', 'Remote', 'https://careers.google.com'),
    ('Frontend Developer', 'Vercel', 'Full-Time', 'San Francisco, CA / Remote', 'https://vercel.com/careers'),
    ('Backend Engineer (Go)', 'Stripe', 'Full-Time', 'Remote', 'https://stripe.com/jobs')
ON CONFLICT DO NOTHING;
