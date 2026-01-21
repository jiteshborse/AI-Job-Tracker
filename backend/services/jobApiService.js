const axios = require('axios');

class JobApiService {
    constructor() {
        this.apiBase = 'https://api.adzuna.com/v1/api/jobs';
        this.appId = process.env.ADZUNA_APP_ID;
        this.appKey = process.env.ADZUNA_APP_KEY;
        
        if (!this.appId || !this.appKey) {
            console.warn('⚠️ Adzuna API credentials not configured. Using mock jobs.');
        }
    }

    /**
     * Search jobs from Adzuna API
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Transformed job listings
     */
    async searchJobs(options = {}) {
        const {
            country = 'us',
            keyword = 'javascript',
            location = '',
            page = 1,
            resultsPerPage = 30,
            sortBy = 'date',
            fullTime = null,
            permanent = null
        } = options;

        try {
            if (!this.appId || !this.appKey) {
                throw new Error('Adzuna API credentials not configured');
            }

            const url = `${this.apiBase}/${country}/search/${page}`;
            
            const params = {
                app_id: this.appId,
                app_key: this.appKey,
                what: keyword || 'software',
                results_per_page: Math.min(resultsPerPage, 50)
            };

            // Add optional parameters
            if (location) {
                params.where = location;
            }
            if (sortBy) {
                params.sort_by = sortBy;
            }
            if (fullTime !== null) {
                params.full_time = fullTime ? 'true' : 'false';
            }
            if (permanent !== null) {
                params.permanent = permanent ? 'true' : 'false';
            }

            console.log(`🔍 Fetching jobs from Adzuna: ${keyword}${location ? ' in ' + location : ''}`);
            
            const response = await axios.get(url, { 
                params,
                timeout: 10000 // 10 second timeout
            });
            
            const transformedJobs = this.transformAdzunaJobs(response.data.results || []);
            console.log(`✅ Retrieved ${transformedJobs.length} jobs from Adzuna`);
            
            return transformedJobs;
        } catch (error) {
            console.error('❌ Adzuna API error:', error.message);
            if (error.response) {
                console.error('API Response status:', error.response.status);
                console.error('Request URL:', `${this.apiBase}/${country}/search/${page}`);
            }
            throw new Error(`Failed to fetch jobs from Adzuna: ${error.message}`);
        }
    }

    /**
     * Transform Adzuna job format to our internal format
     */
    transformAdzunaJobs(jobs) {
        return jobs.map((job, index) => {
            const description = this.cleanDescription(job.description);
            const skills = this.extractSkills(description);
            
            return {
                id: `adzuna_${job.id}`,
                title: job.title || 'Untitled Position',
                company: job.company?.display_name || 'Unknown Company',
                description: description,
                location: job.location?.display_name || 'Remote',
                salary: {
                    min: job.salary_min || null,
                    max: job.salary_max || null,
                    currency: job.salary_currency_code || 'USD',
                    isPredicted: job.salary_is_predicted || false
                },
                postedDate: job.created || new Date().toISOString(),
                applyUrl: job.redirect_url || '',
                source: 'adzuna',
                category: job.category?.tag || 'general',
                jobType: job.contract_type || 'permanent',
                // Skills extracted from job description
                skills: skills,
                // Add mock matching fields for now (will be calculated by AI service)
                matchScore: 0,
                matchBadge: 'low',
                matchSummary: 'Upload a resume to get personalized match insights.',
                matchedSkills: []
            };
        });
    }

    /**
     * Clean HTML description to plain text
     */
    cleanDescription(html) {
        if (!html) return '';
        
        // Remove HTML tags
        let text = html.replace(/<[^>]*>/g, ' ');
        
        // Decode HTML entities
        text = text
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
        
        // Remove extra whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        // Return first 1000 characters
        return text.substring(0, 1000);
    }

    /**
     * Extract tech skills from job description
     */
    extractSkills(text) {
        if (!text) return [];
        
        const commonSkills = [
            'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
            'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'Express', 'Node.js',
            'Django', 'Flask', 'FastAPI', 'Spring', 'Laravel', 'Ruby on Rails',
            'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Redis',
            'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD',
            'Git', 'REST API', 'GraphQL', 'WebSocket', 'OAuth', 'JWT',
            'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap',
            'Testing', 'Jest', 'Pytest', 'Selenium', 'Cypress',
            'Agile', 'Scrum', 'Kanban', 'DevOps', 'Linux'
        ];
        // Escape regex special characters (e.g., C++, C#)
        const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        return commonSkills.filter(skill => {
            const pattern = `\\b${escapeRegExp(skill)}\\b`;
            try {
                return new RegExp(pattern, 'i').test(text);
            } catch {
                // Fallback: simple substring match if regex fails
                return text.toLowerCase().includes(skill.toLowerCase());
            }
        });
    }

    /**
     * Get trending jobs for a keyword
     */
    async getTrendingJobs(keyword = 'javascript', location = '') {
        return this.searchJobs({
            keyword,
            location,
            sortBy: 'date',
            resultsPerPage: 20
        });
    }

    /**
     * Search jobs by location
     */
    async searchByLocation(location, keyword = 'software') {
        return this.searchJobs({
            keyword,
            location,
            resultsPerPage: 25
        });
    }

    /**
     * Health check - verify API is working
     */
    async healthCheck() {
        try {
            const jobs = await this.searchJobs({
                keyword: 'test',
                resultsPerPage: 1
            });
            return {
                status: 'healthy',
                apiConfigured: !!this.appId,
                jobsAvailable: jobs.length > 0
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                apiConfigured: !!this.appId,
                error: error.message
            };
        }
    }
}

module.exports = new JobApiService();
