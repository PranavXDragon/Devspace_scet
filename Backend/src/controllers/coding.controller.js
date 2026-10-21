
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

    const { data: allTestcases, error: testcaseError } = await supabase
      .from('problem_testcases')
      .select('id, input_data, expected_output, is_hidden')
      .eq('problem_id', id);
      
    if (testcaseError) throw testcaseError;
    
    const sampleTestcases = (allTestcases || []).filter(tc => !tc.is_hidden);
    
    res.status(200).json({ 
      success: true, 
      data: { 
        ...problem, 
        testcases: sampleTestcases.length ? sampleTestcases : allTestcases,
        allTestcases: allTestcases || []
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const submitProblemSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceCode, language, status, executionTimeMs, memoryUsedKb, studentId, studentEmail } = req.body;

    if (!sourceCode || !language) {
      return res.status(400).json({ success: false, message: 'Source code and language are required' });
    }

    // Resolve student ID from studentId or studentEmail
    let resolvedStudentId = studentId;
    if (!resolvedStudentId && studentEmail) {
      const { data: student } = await supabase
        .from('student_registrations')
        .select('id')
        .eq('email', studentEmail)
        .maybeSingle();
      if (student) {
        resolvedStudentId = student.id;
      }
    }

    // Fetch problem to know difficulty / reward points
    const { data: problem } = await supabase
      .from('coding_problems')
      .select('id, title, difficulty')
      .eq('id', id)
      .maybeSingle();

    const submissionStatus = status || 'Accepted';
    const xpReward = problem?.difficulty === 'Hard' ? 100 : problem?.difficulty === 'Medium' ? 50 : 25;

    let submissionRecord = null;
    if (resolvedStudentId) {
      const { data: subData, error: subError } = await supabase
        .from('code_submissions')
        .insert([{
          student_id: resolvedStudentId,
          problem_id: id,
          language: language,
          source_code: sourceCode,
          status: submissionStatus,
          execution_time_ms: executionTimeMs || 50,
          memory_used_kb: memoryUsedKb || 12000
        }])
        .select()
        .single();

      if (!subError) {
        submissionRecord = subData;
      }
    }

    // If accepted, update student stats
    if (submissionStatus === 'Accepted' && resolvedStudentId) {
      try {
        const { data: existingStats } = await supabase
          .from('student_stats')
          .select('*')
          .eq('student_id', resolvedStudentId)
          .maybeSingle();

        if (existingStats) {
          await supabase
            .from('student_stats')
            .update({
              total_points: (existingStats.total_points || 0) + xpReward,
              problems_solved: (existingStats.problems_solved || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('student_id', resolvedStudentId);
        } else {
          await supabase
            .from('student_stats')
            .insert([{
              student_id: resolvedStudentId,
              total_points: xpReward,
              problems_solved: 1,
              current_streak: 1
            }]);
        }
      } catch (e) {
        console.error('Error updating student stats:', e);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        submissionId: submissionRecord?.id || 'sub-local',
        status: submissionStatus,
        xpAwarded: submissionStatus === 'Accepted' ? xpReward : 0,
        problemTitle: problem?.title || 'Problem'
      },
      message: submissionStatus === 'Accepted' ? 'Solution accepted!' : 'Submission recorded'
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to record submission', error: error.message });
  }
};
