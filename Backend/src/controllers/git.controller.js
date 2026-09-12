import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getGithubStats = asyncHandler(async (req, res) => {
    const { username } = req.params;
    
    if (!username) {
        throw new ApiError(400, "GitHub username is required");
    }

    try {
        // Fetch user profile
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if (!userRes.ok) throw new Error('GitHub API Error');
        const userData = await userRes.json();
        
        // Fetch repositories
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
        if (!reposRes.ok) throw new Error('GitHub API Error');
        const reposData = await reposRes.json();
        
        const data = {
            profile: userData,
            repos: reposData
        };

        return res.status(200).json(new ApiResponse(200, data, "GitHub stats fetched"));
    } catch (error) {
        throw new ApiError(500, "Failed to fetch GitHub stats. Rate limit exceeded or invalid user.");
    }
});
