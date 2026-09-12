-- Migration to create the 'resources' table

CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Beginner',
    tags TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    author VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
