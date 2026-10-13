import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all questions (Admin view - includes drafts)
export const getAllQuestions = asyncHandler(async (req, res) => {
    // 1. Try questions table
    let { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

    // 2. Fallback to coding_problems table if questions table doesn't exist
    if (error) {
        const { data: altData, error: altError } = await supabase
            .from('coding_problems')
            .select('*')
            .order('created_at', { ascending: false });

        if (!altError && altData) {
            data = altData.map((p) => ({
                id: p.id,
                title: p.title,
                topic: p.topic || 'DSA',
                difficulty: p.difficulty || 'Medium',
                status: p.status || 'Published',
                description: p.description,
                created_at: p.created_at
            }));
            error = null;
        }
    }

    if (error) {
        console.warn("Questions fetch fallback to empty list:", error.message);
        data = [];
    }

    return res.status(200).json(
        new ApiResponse(200, data || [], "Questions fetched successfully")
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
        // Fallback to coding_problems
        const { data: altProblem } = await supabase
            .from('coding_problems')
            .select('*')
            .eq('id', id)
            .single();

        if (altProblem) {
            const { data: testcases } = await supabase
                .from('problem_testcases')
                .select('*')
                .eq('problem_id', id);

            const formattedTestCases = (testcases || []).map((tc) => ({
                id: tc.id,
                input: tc.input_data,
                expected_output: tc.expected_output,
                is_hidden: tc.is_hidden
            }));

            return res.status(200).json(
                new ApiResponse(200, {
                    ...altProblem,
                    topic: altProblem.topic || 'DSA',
                    status: altProblem.status || 'Published',
                    testCases: formattedTestCases
                }, "Question fetched successfully")
            );
        }

        throw new ApiError(404, "Question not found");
    }

    const { data: testCases } = await supabase
        .from('test_cases')
        .select('*')
        .eq('question_id', id);

    return res.status(200).json(
        new ApiResponse(200, { ...question, testCases: testCases || [] }, "Question fetched successfully")
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

    if (!title || !description || !difficulty) {
        throw new ApiError(400, "Missing required fields");
    }

    let question = null;

    // Try questions table
    const { data: qData, error: qError } = await supabase
        .from('questions')
        .insert([{ 
            title, 
            description, 
            difficulty, 
            topic: topic || 'DSA', 
            tags: tags || [], 
            constraints: constraints || 'Standard constraints apply', 
            time_limit_ms: time_limit_ms || 2000, 
            memory_limit_kb: memory_limit_kb || 256000, 
            status: status || 'Draft'
        }])
        .select()
        .single();

    if (!qError && qData) {
        question = qData;
        if (testCases && Array.isArray(testCases) && testCases.length > 0) {
            const testCasesData = testCases.map(tc => ({
                question_id: question.id,
                input: tc.input,
                expected_output: tc.expected_output,
                is_hidden: tc.is_hidden !== undefined ? tc.is_hidden : true
            }));
            await supabase.from('test_cases').insert(testCasesData);
        }
    } else {
        // Fallback to coding_problems table
        const { data: cpData, error: cpError } = await supabase
            .from('coding_problems')
            .insert([{
                title,
                difficulty,
                description,
                starter_code: {
                    javascript: "// Write your code here\n",
                    python: "# Write your code here\n"
                }
            }])
            .select()
            .single();

        if (cpError) {
            throw new ApiError(500, "Failed to create question: " + (qError?.message || cpError.message));
        }

        question = { ...cpData, topic: topic || 'DSA', status: status || 'Draft' };

        if (testCases && Array.isArray(testCases) && testCases.length > 0) {
            const testCasesData = testCases.map(tc => ({
                problem_id: question.id,
                input_data: tc.input,
                expected_output: tc.expected_output,
                is_hidden: tc.is_hidden !== undefined ? tc.is_hidden : true
            }));
            await supabase.from('problem_testcases').insert(testCasesData);
        }
    }

    return res.status(201).json(
        new ApiResponse(201, question, "Question created successfully")
    );
});

// Update a question
export const updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    const testCases = updateData.testCases;
    delete updateData.testCases;

    const { data: question, error: qError } = await supabase
        .from('questions')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (qError) {
        // Fallback update to coding_problems
        const { data: cpQuestion, error: cpError } = await supabase
            .from('coding_problems')
            .update({
                title: updateData.title,
                difficulty: updateData.difficulty,
                description: updateData.description
            })
            .eq('id', id)
            .select()
            .single();

        if (cpError) {
            throw new ApiError(500, "Failed to update question: " + cpError.message);
        }

        if (testCases && Array.isArray(testCases)) {
            await supabase.from('problem_testcases').delete().eq('problem_id', id);
            if (testCases.length > 0) {
                const testCasesData = testCases.map(tc => ({
                    problem_id: id,
                    input_data: tc.input,
                    expected_output: tc.expected_output,
                    is_hidden: tc.is_hidden !== undefined ? tc.is_hidden : true
                }));
                await supabase.from('problem_testcases').insert(testCasesData);
            }
        }

        return res.status(200).json(
            new ApiResponse(200, cpQuestion, "Question updated successfully")
        );
    }

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

    await supabase.from('questions').delete().eq('id', id);
    await supabase.from('coding_problems').delete().eq('id', id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Question deleted successfully")
    );
});
