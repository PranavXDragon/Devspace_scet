-- Disable Supabase Linter Errors by Enabling RLS on all public tables
-- Note: Our API connects using the service_role key, which bypasses RLS.
-- This lockdown simply protects the database from direct public connections.

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boarding_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_qrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_testcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Recreate the leaderboard_view as SECURITY INVOKER to resolve linter warning
DROP VIEW IF EXISTS public.leaderboard_view;

CREATE OR REPLACE VIEW public.leaderboard_view WITH (security_invoker = true) AS
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
    public.student_stats ss
JOIN 
    public.student_registrations sr ON ss.student_id = sr.id
ORDER BY 
    ss.total_points DESC, ss.max_streak DESC;
