const fastify = require('fastify');
const mockJobs = require('../mockJobs');
const aiService = require('../services/aiService');
const storage = require('../storage');
const jobApiService = require('../services/jobApiService');

// Cache for API results
const jobCache = new Map();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

async function fetchJobsFromAPI(keyword, location) {
    try {
        console.log('📡 Fetching jobs from Adzuna API...');
        const jobs = await jobApiService.searchJobs({
            keyword: keyword || 'software engineer',
            location: location || '',
            resultsPerPage: 30,
            sortBy: 'date'
        });
        return jobs;
    } catch (error) {
        console.warn('⚠️ API fetch failed, falling back to mock jobs:', error.message);
        return mockJobs;
    }
}

async function routes(fastify, options) {
    // Health check endpoint
    fastify.get('/health', async (request, reply) => {
        const health = await jobApiService.healthCheck();
        return health;
    });

    // Get all jobs with optional filtering
    fastify.get('/', async (request, reply) => {
        const {
            role,
            skills,
            location,
            jobType,
            workMode,
            datePosted,
            matchScore,
            userId = 'demo-user' // Default for demo
        } = request.query;

        let filteredJobs = [];

        // Fetch jobs from API with caching
        const cacheKey = `jobs_${role || 'default'}_${location || 'all'}`;
        const cached = jobCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('📦 Using cached jobs');
            filteredJobs = [...cached.data];
        } else {
            console.log('🔄 Fetching fresh job data...');
            filteredJobs = await fetchJobsFromAPI(role || 'software engineer', location);
            jobCache.set(cacheKey, { data: filteredJobs, timestamp: Date.now() });
        }

        // Apply filters
        if (role) {
            filteredJobs = filteredJobs.filter(job =>
                job.title.toLowerCase().includes(role.toLowerCase())
            );
        }

        if (skills) {
            const skillList = skills.split(',');
            filteredJobs = filteredJobs.filter(job => {
                const jobSkills = job.matchedSkills || [];
                return skillList.some(skill => 
                    jobSkills.some(js => js.toLowerCase().includes(skill.toLowerCase()))
                );
            });
        }

        if (location) {
            filteredJobs = filteredJobs.filter(job =>
                job.location && job.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (jobType) {
            filteredJobs = filteredJobs.filter(job => 
                job.jobType && job.jobType.toLowerCase() === jobType.toLowerCase()
            );
        }

        if (datePosted) {
            const now = new Date();
            let cutoffDate = new Date();

            switch (datePosted) {
                case '24h':
                    cutoffDate.setHours(now.getHours() - 24);
                    break;
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                default:
                // Any time - no filter
            }

            if (datePosted !== 'any') {
                filteredJobs = filteredJobs.filter(job => {
                    const jobDate = new Date(job.postedDate);
                    return jobDate >= cutoffDate;
                });
            }
        }

        // Get user's resume for matching
        const userResume = storage.getResume(userId);

        // Calculate match scores if resume exists
        let jobsWithScores;
        try {
            jobsWithScores = await Promise.all(
                filteredJobs.map(async (job) => {
                    let matchScore = 50; // Default score
                    let matchSummary = 'Upload a resume to get personalized match insights.';
                    let matchedSkills = [];

                    if (userResume) {
                        try {
                            // Use job skills extracted from description
                            const jobSkills = job.skills || [];
                            const insights = await aiService.calculateMatchInsights(userResume, {
                                ...job,
                                skills: jobSkills
                            });
                            matchScore = insights.score;
                            matchSummary = insights.summary;
                            matchedSkills = insights.matchedSkills;
                        } catch (aiError) {
                            console.error('AI match error for job', job.id, ':', aiError.message);
                            matchScore = 50; // Fallback score
                        }
                    } else {
                        // No resume - give low score but still show jobs
                        matchScore = 30;
                        matchSummary = 'Upload a resume to see how well you match this role.';
                    }

                    return {
                        ...job,
                        matchScore,
                        matchBadge: matchScore > 70 ? 'high' : matchScore > 40 ? 'medium' : 'low',
                        matchSummary,
                        matchedSkills
                    };
                })
            );
        } catch (error) {
            console.error('Error processing jobs:', error);
            reply.code(500).send({
                error: 'Failed to process jobs',
                message: error.message
            });
            return;
        }

        // Apply match score filter if specified
        let finalJobs = jobsWithScores;
        if (matchScore) {
            switch (matchScore) {
                case 'high':
                    finalJobs = jobsWithScores.filter(j => j.matchScore > 70);
                    break;
                case 'medium':
                    finalJobs = jobsWithScores.filter(j => j.matchScore > 40 && j.matchScore <= 70);
                    break;
                case 'low':
                    finalJobs = jobsWithScores.filter(j => j.matchScore <= 40);
                    break;
            }
        }

        // Sort by match score (highest first)
        finalJobs.sort((a, b) => b.matchScore - a.matchScore);

        return {
            jobs: finalJobs,
            total: finalJobs.length,
            bestMatches: finalJobs.slice(0, 8) // Top matches
        };
    });

    // Get single job by ID
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params;
        
        // Try to find in mock jobs first (for backward compatibility)
        let job = mockJobs.find(j => j.id === id);
        
        if (!job) {
            reply.code(404).send({ error: 'Job not found' });
            return;
        }

        return job;
    });

    // Direct API search endpoint
    fastify.get('/api/search', async (request, reply) => {
        const { keyword = 'software engineer', location = '', page = 1 } = request.query;
        
        try {
            const jobs = await jobApiService.searchJobs({
                keyword,
                location,
                page: parseInt(page),
                resultsPerPage: 30
            });

            return {
                success: true,
                jobs,
                count: jobs.length,
                source: 'adzuna'
            };
        } catch (error) {
            return reply.code(500).send({
                success: false,
                error: 'Failed to search jobs',
                message: error.message
            });
        }
    });
}

module.exports = routes;