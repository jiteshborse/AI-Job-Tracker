const fastify = require('fastify');
const storage = require('../storage');
const { authenticate } = require('../middleware/auth');

async function routes(fastify, options) {
    // Apply authenticate hook to all endpoints in this router
    fastify.addHook('preHandler', authenticate);

    // Track application
    fastify.post('/track', async (request, reply) => {
        const userId = request.userId;
        const {
            jobId,
            jobTitle,
            company,
            status = 'Applied',
            appliedDate = new Date().toISOString()
        } = request.body || {};

        if (!jobId || !jobTitle || !company) {
            reply.code(400).send({ error: 'Missing required fields' });
            return;
        }

        const application = await storage.addApplication(userId, {
            jobId,
            jobTitle,
            company,
            status,
            appliedDate
        });

        return {
            success: true,
            application,
            message: 'Application tracked successfully'
        };
    });

    // Update application status
    fastify.put('/:id/status', async (request, reply) => {
        const userId = request.userId;
        const { id } = request.params;
        const { status } = request.body || {};

        const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];

        if (!validStatuses.includes(status)) {
            reply.code(400).send({ error: 'Invalid status' });
            return;
        }

        const updatedApp = await storage.updateApplicationStatus(userId, id, status);

        if (!updatedApp) {
            reply.code(404).send({ error: 'Application not found' });
            return;
        }

        return {
            success: true,
            application: updatedApp
        };
    });

    // Get all applications for user
    fastify.get('/', async (request, reply) => {
        const userId = request.userId;
        const { status } = request.query;
        let applications = await storage.getApplications(userId);

        // Filter by status if provided
        if (status) {
            applications = applications.filter(app => app.status === status);
        }

        // Sort by date (newest first)
        applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
            applications,
            total: applications.length,
            stats: {
                applied: applications.filter(app => app.status === 'Applied').length,
                interview: applications.filter(app => app.status === 'Interview').length,
                offer: applications.filter(app => app.status === 'Offer').length,
                rejected: applications.filter(app => app.status === 'Rejected').length
            }
        };
    });

    // Clear all applications for a user (used on logout)
    fastify.delete('/clear', async (request, reply) => {
        const userId = request.userId;
        await storage.clearApplications(userId);

        return {
            success: true,
            applications: [],
            message: 'Applications cleared'
        };
    });

    // Delete single application
    fastify.delete('/:id', async (request, reply) => {
        const userId = request.userId;
        const { id } = request.params;

        const deleted = await storage.deleteApplication(userId, id);

        if (!deleted) {
            reply.code(404).send({ error: 'Application not found' });
            return;
        }

        return {
            success: true,
            message: 'Application deleted successfully'
        };
    });
}

module.exports = routes;