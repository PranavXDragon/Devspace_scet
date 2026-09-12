import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set in .env!");
}

// Initialize Supabase Client with Service Role Key for backend administration bypass
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
