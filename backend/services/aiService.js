const axios = require('axios');
const FileParser = require('../utils/fileParser');
require('dotenv').config();

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.model = 'gemini-1.5-flash';
    }

    async callGemini(prompt, temperature = 0.7, maxTokens = 200) {
        if (!this.apiKey || this.apiKey.length < 10) {
            throw new Error('Gemini API key not configured');
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
        
        const response = await axios.post(url, {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: maxTokens
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error('Invalid response format from Gemini API');
        }
        return text.trim();
    }

    // Calculate match score between resume and job
    async calculateMatchScore(resumeText, jobDescription, jobSkills = []) {
        try {
            // Ensure resumeText is a string
            const resumeString = typeof resumeText === 'string' ? resumeText : (resumeText?.content || JSON.stringify(resumeText));
            
            if (!resumeString || resumeString.length < 10) {
                return this.fallbackMatchScore(resumeString || '', jobSkills);
            }

            // Use fallback first as primary method - it's more reliable
            const fallbackScore = this.fallbackMatchScore(resumeString, jobSkills);
            
            // Try Gemini for additional context-aware scoring
            try {
                const prompt = `
        Calculate a match percentage (0-100) between this resume and job description.
        
        RESUME TEXT (first 1500 chars):
        ${resumeString.substring(0, 1500)}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        JOB SKILLS:
        ${jobSkills.join(', ')}
        
        Consider:
        1. Skills match (most important)
        2. Experience level alignment
        3. Job type compatibility
        4. Industry relevance
        
        Return ONLY a number between 0-100. No explanations.
      `;

                const aiResponseText = await this.callGemini(prompt, 0.1, 10);
                const aiScore = parseInt(aiResponseText);
                
                if (isNaN(aiScore)) {
                    throw new Error('Gemini response is not a number: ' + aiResponseText);
                }

                // Average the scores for better accuracy
                return Math.round((fallbackScore + Math.min(Math.max(aiScore, 0), 100)) / 2);
            } catch (aiError) {
                // If Gemini fails, just use fallback
                console.log('Gemini unavailable, using fallback scoring:', aiError.message);
                return fallbackScore;
            }
        } catch (error) {
            console.error('Match score error:', error.message);
            // Fallback: Simple keyword matching
            const resumeString = typeof resumeText === 'string' ? resumeText : (resumeText?.content || '');
            return this.fallbackMatchScore(resumeString, jobSkills);
        }
    }

    async calculateMatchInsights(resumeText, job) {
        const { description = '', skills = [], type, workMode } = job || {};
        const score = await this.calculateMatchScore(resumeText, description, skills);

        // Ensure resumeText is a string
        const resumeString = typeof resumeText === 'string' ? resumeText : (resumeText?.content || '');
        const resumeLower = (resumeString || '').toLowerCase();
        const matchedSkills = skills.filter(skill => resumeLower.includes(skill.toLowerCase()));
        const missingSkills = skills.filter(skill => !resumeLower.includes(skill.toLowerCase()));

        const summaryParts = [];
        if (matchedSkills.length) summaryParts.push(`Matched skills: ${matchedSkills.join(', ')}`);
        if (type) summaryParts.push(`Role fit: ${type}`);
        if (workMode) summaryParts.push(`Work mode: ${workMode}`);
        const summary = summaryParts.join(' • ') || 'General alignment based on resume keywords.';

        return {
            score,
            matchedSkills,
            missingSkills,
            summary
        };
    }

    // Fallback scoring - improved with weighted skill matching
    fallbackMatchScore(resumeText, jobSkills) {
        const resumeString = typeof resumeText === 'string' ? resumeText : (resumeText?.content || '');
        if (!resumeString) return 30; // No resume, low score
        
        const resumeLower = resumeString.toLowerCase();
        
        // Exact skill matches (highest weight)
        let exactMatches = 0;
        // Partial matches (lower weight)
        let partialMatches = 0;
        
        jobSkills.forEach(skill => {
            const skillLower = skill.toLowerCase();
            // Look for exact words (word boundaries)
            const exactPattern = new RegExp(`\\b${skillLower}\\b`);
            if (exactPattern.test(resumeLower)) {
                exactMatches++;
            } 
            // Look for partial matches as backup
            else if (resumeLower.includes(skillLower)) {
                partialMatches++;
            }
        });
        
        // Calculate score: exact matches worth more
        const totalSkillsInJob = jobSkills.length || 1;
        const score = ((exactMatches * 100 + partialMatches * 50) / (totalSkillsInJob * 100)) * 100;
        
        // Return score, minimum 25% for any resume match attempt
        return Math.min(100, Math.max(Math.round(score), 25));
    }

    // Extract skills from resume text
    extractResumeSkills(resumeText) {
        const resumeString = typeof resumeText === 'string' ? resumeText : (resumeText?.content || '');
        if (!resumeString) return [];
        
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
        
        return commonSkills.filter(skill =>
            new RegExp(`\\b${skill}\\b`, 'i').test(resumeString)
        );
    }

    // Chat assistant with smart fallback
    async handleChatQuery(query, context = {}) {
        const contextPrompt = `
      You are a helpful job search assistant for an AI Job Tracker app.
      
      User Query: "${query}"
      
      Available context:
      - User has ${context.resumeUploaded ? 'uploaded' : 'not uploaded'} a resume
      - ${context.applicationCount || 0} applications tracked
      - Current filters: ${context.filters || 'none'}
      - Resume skills: ${(context.resumeSkills || []).join(', ') || 'none'}
      
      Available app features:
      1. Job Feed with filters (role, skills, location, job type, work mode)
      2. Resume upload (PDF/TXT)
      3. AI matching scores on jobs
      4. Application tracking (Applied → Interview → Offer/Rejected)
      5. Dashboard to view all applications
      
      Answer helpfully and concisely. If user asks to filter jobs, suggest which filters to use.
      If asking how to use the app, give brief instructions.
    `;

        try {
            return await this.callGemini(contextPrompt, 0.7, 200);
        } catch (error) {
            console.error('Gemini Error:', error.message);
            // Return intelligent fallback based on query
            return this.generateFallbackResponse(query, context);
        }
    }

    // Intelligent fallback response generator
    generateFallbackResponse(query, context) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('remote') || lowerQuery.includes('location')) {
            return "📍 I see you're interested in remote jobs! Use the sidebar to filter:\n1. Go to Work Mode dropdown\n2. Select 'Remote'\n3. Choose your preferred location\n\nJobs matching your filters will appear instantly.";
        } 
        if (lowerQuery.includes('match') || lowerQuery.includes('score') || lowerQuery.includes('algorithm')) {
            return "🎯 How Match Scores Work:\n\n• Skills Alignment: We compare your resume skills with job requirements (60% weight)\n• Experience Level: We match your seniority (20% weight)\n• Location Fit: Considers your preferences (10% weight)\n• Job Type: Evaluates role fit (10% weight)\n\nHigher scores = better matches for you!";
        }
        if (lowerQuery.includes('resume') || lowerQuery.includes('upload')) {
            return "📄 Resume Upload Guide:\n\n1. Click 'Upload Resume' button (top-right)\n2. Drag & drop your file or click to browse\n3. We support: PDF, DOCX, DOC, TXT\n4. Once uploaded, we'll extract your skills automatically\n\nYour resume will be used to calculate match scores on all jobs!";
        }
        if (lowerQuery.includes('application') || lowerQuery.includes('track')) {
            return `📋 Application Tracking:\n\nYou have ${context.applicationCount || 0} applications tracked.\n\n1. Click 'Applications' in the nav\n2. View all your tracked jobs\n3. Update status: Applied → Interview → Offer/Rejected\n4. See your application timeline\n\nWe keep all your job history organized!`;
        }
        if (lowerQuery.includes('filter') || lowerQuery.includes('search')) {
            return "🔍 Filtering & Search Tips:\n\n• Role: Filter by job title (React Developer, Designer, etc.)\n• Skills: Select required tech skills\n• Location: Choose working location\n• Job Type: Full-time, Part-time, Contract\n• Work Mode: On-site, Remote, Hybrid\n\nCombine multiple filters for precise results!";
        }
        if (lowerQuery.includes('how') && (lowerQuery.includes('work') || lowerQuery.includes('app'))) {
            return "🚀 Getting Started:\n\n1. Upload your resume for better matches\n2. Browse jobs or use filters to narrow down\n3. Click jobs to see match scores\n4. Track applications as you apply\n5. Update application status over time\n\nOur AI learns from your activity to improve recommendations!";
        }
        if (lowerQuery.includes('salary') || lowerQuery.includes('pay') || lowerQuery.includes('compensation')) {
            return "💰 Salary Information:\n\nMany job listings include salary ranges. Use the filter sidebar to:\n• Set your desired salary range\n• View salary estimates for roles\n• Filter by compensation level\n\nOur data comes from Adzuna, a comprehensive job database!";
        }

        // Generic helpful fallback
        return "💡 I'm here to help! You can ask me about:\n\n• Uploading your resume\n• How match scores work\n• Using filters to find jobs\n• Tracking your applications\n• Getting started with the app\n\nWhat would you like to know more about?";
    }

    // AI-based Resume Parsing
    async extractResumeInfo(resumeText) {
        try {
            const prompt = `
        You are an expert resume parser. Extract structured information from the following resume text.
        
        RESUME TEXT:
        ${resumeText.substring(0, 8000)}
        
        Extract the following fields and return them strictly in JSON format (no markdown code blocks, no explanation, just raw JSON):
        {
            "primaryRole": "The most appropriate job title for the candidate (e.g. Frontend Engineer, Full Stack Developer, Data Scientist, Sales Manager)",
            "skills": ["List of all professional tech/soft skills found"],
            "experience": ["Brief summary of past jobs/projects"],
            "education": ["Degrees and schools"],
            "contact": {
                "email": "extracted email address",
                "phone": "extracted phone number",
                "linkedin": "linkedin URL"
            },
            "experienceYears": 5, // Estimated total years of experience as a number
            "summary": "A short professional summary (max 200 words)"
        }
        `;

            const aiResponseText = await this.callGemini(prompt, 0.1, 800);
            
            // Clean markdown code blocks from response if present
            let jsonString = aiResponseText;
            if (jsonString.startsWith('```json')) {
                jsonString = jsonString.substring(7);
            } else if (jsonString.startsWith('```')) {
                jsonString = jsonString.substring(3);
            }
            if (jsonString.endsWith('```')) {
                jsonString = jsonString.substring(0, jsonString.length - 3);
            }
            jsonString = jsonString.trim();

            const parsed = JSON.parse(jsonString);
            return parsed;
        } catch (error) {
            console.error('Gemini Resume Parsing Error:', error.message);
            // Fallback to local heuristic parser
            return FileParser.extractResumeInfo(resumeText);
        }
    }
}

module.exports = new AIService();