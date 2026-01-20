# Job API Comparison: Adzuna vs JSearch vs Alternatives

## Executive Summary

| Aspect | Adzuna | JSearch | Remote Jobs API |
|--------|--------|---------|-----------------|
| **Free Tier** | ✅ Yes (free with quota) | ✅ Yes | ✅ Yes |
| **Job Count** | 500K+ | 50K+ | Varies |
| **Setup Difficulty** | Easy | Moderate | Easy |
| **Rate Limits** | 10 req/s free | Higher on paid | Unknown |
| **Countries** | 70+ | US/UK/Canada focused | Remote only |
| **API Documentation** | ⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good | ⭐⭐⭐ Good |
| **CORS Support** | Via header | Via header | Yes |
| **Cost** | Free + Premium | Free + Premium | Free |

---

## 1. Adzuna API (RECOMMENDED ✅)

### Pros
- ✅ **Free tier available** - no credit card required
- ✅ **Largest database** - 500K+ job listings
- ✅ **Global coverage** - 70+ countries
- ✅ **Simple REST API** - easy to integrate
- ✅ **Excellent documentation** - clear examples and endpoints
- ✅ **Multiple data formats** - JSON, JSONP, XML
- ✅ **No CORS issues** - JSONP callback support
- ✅ **Established** - reliable, been around since 2011

### Cons
- ⚠️ Requires registration for API key
- ⚠️ Rate limits on free tier (reasonable for demo)
- ⚠️ Free tier may have usage restrictions

### Pricing
- **Free Tier**: 100 requests/month (sufficient for development)
- **Paid Plans**: Starting $99/month for higher quota
- **Student/Non-profit**: Special rates available

### Registration & Setup
1. Visit: https://developer.adzuna.com/signup
2. Register account
3. Receive `app_id` and `app_key` immediately
4. Start making requests

### API Endpoints

**Search Jobs**
```
GET https://api.adzuna.com/v1/api/jobs/{country}/search/{page}

Parameters:
- app_id: Your app ID
- app_key: Your app key
- what: Job title/keyword (e.g., "software engineer")
- where: Location
- results_per_page: 1-50 (default 20)
- sort_by: date / relevance
- full_time: true/false
- permanent: true/false
- company: Filter by company name

Response:
{
  "results": [
    {
      "id": "job_id",
      "title": "Software Engineer",
      "company": {
        "display_name": "Tech Corp"
      },
      "description": "Job description...",
      "location": {
        "area": ["New York", "NY"],
        "display_name": "New York, NY"
      },
      "salary_is_predicted": false,
      "salary_min": 80000,
      "salary_max": 120000,
      "salary_currency_code": "USD",
      "created": "2026-01-20T10:30:00Z",
      "redirect_url": "https://www.adzuna.com/..." 
    }
  ],
  "count": 150,
  "mean": 95000
}
```

---

## 2. JSearch API (Alternative)

### Pros
- ✅ Free tier available
- ✅ Good job coverage for US/UK/Canada
- ✅ Detailed job information
- ✅ Easy integration

### Cons
- ⚠️ Requires RapidAPI account (extra step)
- ⚠️ More limited geographic coverage
- ⚠️ Lower free tier quota
- ⚠️ Documentation less comprehensive

### Pricing
- **Free Tier**: Limited requests/day
- **Paid Plans**: Usage-based pricing

---

## 3. Remote Jobs API (Light Alternative)

### Pros
- ✅ Completely free
- ✅ Focus on remote positions
- ✅ Simple integration
- ✅ No registration required

### Cons
- ⚠️ Remote jobs only (not comprehensive)
- ⚠️ Limited job count
- ⚠️ Less filtering options

---

## RECOMMENDATION: Adzuna API

**Why Adzuna?**
1. **Best for demo/development** - Free tier with good quota
2. **Comprehensive job data** - 500K+ listings globally
3. **Simple integration** - REST API, no complex authentication
4. **Future-proof** - Can upgrade to paid as app grows
5. **Best documentation** - Easiest to implement

---

## Implementation Steps for Your Project

### Step 1: Register for Adzuna API

```
1. Go to: https://developer.adzuna.com/signup
2. Fill registration form
3. Verify email
4. Get app_id and app_key
5. Add to .env file
```

### Step 2: Update Backend Service

Create `backend/services/jobApiService.js`:

```javascript
const axios = require('axios');

class JobApiService {
    constructor() {
        this.apiBase = 'https://api.adzuna.com/v1/api/jobs';
        this.appId = process.env.ADZUNA_APP_ID;
        this.appKey = process.env.ADZUNA_APP_KEY;
    }

    async searchJobs(options = {}) {
        const {
            country = 'us',
            keyword = 'javascript',
            location = '',
            page = 1,
            resultsPerPage = 20,
            sortBy = 'date',
            fullTime = true
        } = options;

        try {
            const url = `${this.apiBase}/${country}/search/${page}`;
            
            const params = {
                app_id: this.appId,
                app_key: this.appKey,
                what: keyword,
                results_per_page: resultsPerPage,
                sort_by: sortBy,
                full_time: fullTime ? 'true' : 'false',
                content_type: 'json'
            };

            if (location) {
                params.where = location;
            }

            const response = await axios.get(url, { params });
            
            return this.transformAdzunaJobs(response.data.results || []);
        } catch (error) {
            console.error('Adzuna API error:', error.message);
            throw new Error(`Failed to fetch jobs: ${error.message}`);
        }
    }

    transformAdzunaJobs(jobs) {
        return jobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company.display_name,
            description: this.cleanDescription(job.description),
            location: job.location?.display_name || 'Remote',
            salary: {
                min: job.salary_min,
                max: job.salary_max,
                currency: job.salary_currency_code || 'USD',
                isPredicted: job.salary_is_predicted
            },
            postedDate: job.created,
            applyUrl: job.redirect_url,
            source: 'adzuna',
            tags: this.extractTags(job.description)
        }));
    }

    cleanDescription(html) {
        // Remove HTML tags
        return html.replace(/<[^>]*>/g, '').substring(0, 500);
    }

    extractTags(text) {
        // Extract common tech skills from description
        const skills = [
            'JavaScript', 'Python', 'React', 'Node.js', 'SQL',
            'Java', 'C++', 'Ruby', 'Go', 'Rust', 'TypeScript'
        ];
        
        return skills.filter(skill =>
            new RegExp(`\\b${skill}\\b`, 'i').test(text)
        );
    }
}

module.exports = new JobApiService();
```

### Step 3: Update Jobs Route

```javascript
// In backend/routes/jobs.js

const jobApiService = require('../services/jobApiService');
const mockJobs = require('../mockJobs');

async function routes(fastify, options) {
    // Endpoint to fetch from real API
    fastify.get('/search', async (request, reply) => {
        try {
            const { keyword, location, page = 1 } = request.query;
            
            const jobs = await jobApiService.searchJobs({
                keyword: keyword || 'javascript',
                location: location || '',
                page: parseInt(page)
            });
            
            return {
                jobs,
                source: 'adzuna',
                count: jobs.length
            };
        } catch (error) {
            return reply.code(500).send({
                error: 'Failed to fetch jobs',
                message: error.message
            });
        }
    });

    // Keep existing endpoint but mix with real jobs
    fastify.get('/', async (request, reply) => {
        const { userId, keyword = '', location = '' } = request.query;
        
        try {
            // Try fetching from real API
            let jobs = [];
            try {
                jobs = await jobApiService.searchJobs({
                    keyword: keyword || 'javascript',
                    location
                });
            } catch (error) {
                console.warn('Using mock jobs as fallback');
                jobs = mockJobs;
            }

            // Rest of your existing logic...
            // (apply filters, calculate scores, etc.)
        } catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    });
}
```

### Step 4: Update .env File

```env
# Adzuna API
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
```

### Step 5: Update Frontend (Optional)

Create `frontend/src/services/jobSearch.js`:

```javascript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const jobSearchApi = {
    searchJobs: (keyword, location, page = 1) =>
        axios.get(`${API_BASE}/jobs/search`, {
            params: { keyword, location, page }
        }),

    getTrendingJobs: () =>
        axios.get(`${API_BASE}/jobs/trending`),

    getJobsByLocation: (location) =>
        axios.get(`${API_BASE}/jobs`, {
            params: { location }
        })
};

export default jobSearchApi;
```

---

## Quick Start Checklist

- [ ] Sign up at https://developer.adzuna.com/signup
- [ ] Receive `app_id` and `app_key`
- [ ] Add to backend `.env`
- [ ] Create `jobApiService.js`
- [ ] Update `jobs.js` route with API integration
- [ ] Test with `npm run dev`
- [ ] Fetch real job data! 🎉

---

## Fallback Strategy

For production reliability, implement a **fallback system**:

```javascript
async function getJobs() {
    try {
        // Try Adzuna API first
        return await jobApiService.searchJobs();
    } catch (error) {
        console.warn('Adzuna API failed, using mock data');
        // Fallback to mock jobs
        return mockJobs;
    }
}
```

---

## Rate Limits & Best Practices

### Adzuna Free Tier
- **100 requests/month** (sufficient for demo)
- **10 requests/second** max
- **Caching recommended** - cache results for 24 hours

### Caching Strategy

```javascript
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function getJobsCached(keyword) {
    const cacheKey = `jobs_${keyword}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    
    const jobs = await jobApiService.searchJobs({ keyword });
    cache.set(cacheKey, { data: jobs, timestamp: Date.now() });
    return jobs;
}
```

---

## Conclusion

**Use Adzuna API** for your project because:
1. ✅ Free tier suitable for development
2. ✅ Easiest integration
3. ✅ Best documentation
4. ✅ Largest job database
5. ✅ No CORS issues
6. ✅ Scalable to paid plans

Start with Adzuna, and you can always add multiple sources later for better coverage!
