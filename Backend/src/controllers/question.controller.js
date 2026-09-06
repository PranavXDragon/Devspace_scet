import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all questions (Admin view - includes drafts)
export const getAllQuestions = asyncHandler(async (req, res) => {
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new ApiError(500, "Failed to fetch questions");
    }

    return res.status(200).json(
        new ApiResponse(200, data, "Questions fetched successfully")
    );
});

// Get single question with test cases (Admin view)
export const getQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: question, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();

    if (qError || !question) {
        throw new ApiError(404, "Question not found");
    }

    const { data: testCases, error: tError } = await supabase
        .from('test_cases')
        .select('*')
        .eq('question_id', id);

    if (tError) {
        throw new ApiError(500, "Failed to fetch test cases");
    }

    return res.status(200).json(
        new ApiResponse(200, { ...question, testCases }, "Question fetched successfully")
    );
});

// Create a new question
export const createQuestion = asyncHandler(async (req, res) => {
    const { 
        title, 
        description, 
        difficulty, 
        topic, 
        tags, 
        constraints, 
        time_limit_ms, 
        memory_limit_kb, 
        status,
        testCases 
    } = req.body;

    if (!title || !description || !difficulty || !topic || !constraints) {
        throw new ApiError(400, "Missing required fields");
    }

    // Insert Question
    const { data: question, error: qError } = await supabase
        .from('questions')
        .insert([{ 
            title, 
            description, 
            difficulty, 
            topic, 
            tags: tags || [], 
            constraints, 
            time_limit_ms: time_limit_ms || 2000, 
            memory_limit_kb: memory_limit_kb || 256000, 
            status: status || 'Draft'
        }])
        .select()
        .single();

    if (qError) {
        throw new ApiError(500, "Failed to create question: " + qError.message);
    }

    // Insert Test Cases if provided
    if (testCases && Array.isArray(testCases) && testCases.length > 0) {
        const testCasesData = testCases.map(tc => ({
            question_id: question.id,
            input: tc.input,
            expected_output: tc.expected_output,
            is_hidden: tc.is_hidden !== undefined ? tc.is_hidden : true
        }));

        const { error: tError } = await supabase
            .from('test_cases')
            .insert(testCasesData);

        if (tError) {
            // Rollback is complex in supabase REST, but we can delete the question
            await supabase.from('questions').delete().eq('id', question.id);
            throw new ApiError(500, "Failed to add test cases: " + tError.message);
        }
    }

    return res.status(201).json(
        new ApiResponse(201, question, "Question created successfully")
    );
});

// Update a question
export const updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Remove testCases from updateData if present, as they need separate handling
    const testCases = updateData.testCases;
    delete updateData.testCases;

    const { data: question, error: qError } = await supabase
        .from('questions')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (qError) {
        throw new ApiError(500, "Failed to update question: " + qError.message);
    }

    // If test cases are provided, we replace all existing ones for simplicity
    if (testCases && Array.isArray(testCases)) {
        await supabase.from('test_cases').delete().eq('question_id', id);
        
        if (testCases.length > 0) {
            const testCasesData = testCases.map(tc => ({
                question_id: id,
                input: tc.input,
                expected_output: tc.expected_output,
                is_hidden: tc.is_hidden !== undefined ? tc.is_hidden : true
            }));
            await supabase.from('test_cases').insert(testCasesData);
        }
    }

    return res.status(200).json(
        new ApiResponse(200, question, "Question updated successfully")
    );
});

// Delete a question
export const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

    if (error) {
        throw new ApiError(500, "Failed to delete question");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Question deleted successfully")
    );
});
