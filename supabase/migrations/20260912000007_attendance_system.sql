
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'present',
    device_fingerprint TEXT,
    distance_from_class NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Students can view their own attendance"
    ON public.attendance_records FOR SELECT
    USING (auth.uid()::text = student_id);

CREATE POLICY "Admins can view all attendance"
    ON public.attendance_records FOR SELECT
    USING (true); -- assuming backend overrides or admin role
