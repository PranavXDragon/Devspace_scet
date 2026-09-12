
import { supabase } from '../config/supabase.js';

export const getProblems = async (req, res) => {
  try {
    const { data: problems, error } = await supabase
      .from('coding_problems')
      .select('id, title, difficulty')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.status(200).json({ success: true, data: problems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: problem, error: problemError } = await supabase
      .from('coding_problems')
      .select('*')
      .eq('id', id)
      .single();
      
    if (problemError || !problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const { data: testcases, error: testcaseError } = await supabase
      .from('problem_testcases')
      .select('input_data, expected_output')
      .eq('problem_id', id)
      .eq('is_hidden', false);
      
    if (testcaseError) throw testcaseError;
    
    res.status(200).json({ success: true, data: { ...problem, testcases } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
