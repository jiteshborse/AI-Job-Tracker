const fastify = require('fastify');
const aiService = require('../services/aiService');
const storage = require('../storage');

async function routes(fastify, options) {
    // AI Chat endpoint
    fastify.post('/chat', async (request, reply) => {
        const {
            query,
            userId = 'demo-user',
            context = {}
        } = request.body;

        if (!query) {
            reply.code(400).send({ error: 'Query is required' });
            return;
        }

        // Get user context
        const userResume = storage.getResume(userId);
        const applications = storage.getApplications(userId);

        const enhancedContext = {
            ...context,
            resumeUploaded: !!userResume,
            applicationCount: applications.length,
            filters: context.filters || 'none'
        };

        const response = await aiService.handleChatQuery(query, enhancedContext);

        return {
            response,
            timestamp: new Date().toISOString()
        };
    });
}

module.exports = routes;