const fastify = require('fastify');
const aiService = require('../services/aiService');
const storage = require('../storage');
const { authenticate } = require('../middleware/auth');

async function routes(fastify, options) {
    // Apply authenticate hook to all endpoints in this router
    fastify.addHook('preHandler', authenticate);

    // AI Chat endpoint
    fastify.post('/chat', async (request, reply) => {
        const {
            query,
            context = {}
        } = request.body || {};

        const userId = request.userId;

        if (!query) {
            reply.code(400).send({ error: 'Query is required' });
            return;
        }

        // Get user context
        const userResume = await storage.getResume(userId);
        const applications = await storage.getApplications(userId);

        const enhancedContext = {
            ...context,
            resumeUploaded: !!userResume,
            applicationCount: applications.length,
            filters: context.filters || 'none',
            resumeSkills: userResume?.extractedInfo?.skills || []
        };

        const response = await aiService.handleChatQuery(query, enhancedContext);

        return {
            response,
            timestamp: new Date().toISOString()
        };
    });
}

module.exports = routes;