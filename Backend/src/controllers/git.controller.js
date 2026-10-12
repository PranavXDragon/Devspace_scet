import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getGithubStats = asyncHandler(async (req, res) => {
    const { username } = req.params;
    
    if (!username || username.trim() === '') {
        throw new ApiError(400, "GitHub username is required");
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    try {
        const headers = {
            'User-Agent': 'DevSpace-Coding-Club',
            'Accept': 'application/vnd.github.v3+json',
            ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {})
        };

        // Fetch user profile
        const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, { headers });
        if (userRes.status === 404) {
            throw new ApiError(404, `GitHub user '@${cleanUsername}' not found`);
        }
        if (!userRes.ok) {
            const errData = await userRes.json().catch(() => ({}));
            throw new ApiError(userRes.status, errData.message || 'GitHub API Error');
        }
        const userData = await userRes.json();
        
        // Fetch repositories
        const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=6`, { headers });
        const reposData = reposRes.ok ? await reposRes.json() : [];
        
        const data = {
            profile: userData,
            repos: reposData
        };

        return res.status(200).json(new ApiResponse(200, data, "GitHub stats fetched"));
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, error.message || "Failed to fetch GitHub stats. Rate limit exceeded or invalid user.");
    }
});
