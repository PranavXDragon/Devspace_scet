
import 'dotenv/config';
import { supabase } from './src/config/supabase.js';

async function test() {
  const { data, error } = await supabase.from('coding_problems').select('id').limit(1);
  console.log('Test Result:', { data, error });
}
test();
