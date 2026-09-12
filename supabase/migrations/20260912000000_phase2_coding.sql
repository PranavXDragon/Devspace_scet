-- DevSpace Phase 2: Coding Platform Migration

-- 1. Coding Problems Table
CREATE TABLE IF NOT EXISTS coding_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    description TEXT NOT NULL,
    starter_code JSONB DEFAULT '{}', -- Example: {"javascript": "function solve() {}", "python": "def solve():"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Problem Testcases Table
CREATE TABLE IF NOT EXISTS problem_testcases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Code Submissions Table
CREATE TABLE IF NOT EXISTS code_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_registrations(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    source_code TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error')),
    execution_time_ms INTEGER,
    memory_used_kb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add some mock data to test the IDE
INSERT INTO coding_problems (title, difficulty, description, starter_code)
VALUES (
    'Two Sum', 
    'Easy', 
    'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n**Example 1:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n```', 
    '{"javascript": "function twoSum(nums, target) {\n  // Write your code here\n}", "python": "def twoSum(nums, target):\n  # Write your code here"}'
);
