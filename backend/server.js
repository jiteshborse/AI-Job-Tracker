const fastify = require('fastify')({
    logger: {
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname'
            }
        }
    }
});
const cors = require('@fastify/cors');
const fastifyMultipart = require('@fastify/multipart');
const path = require('path');
require('dotenv').config();

// Import middleware
const { corsOptions } = require('./middleware/auth');

// Register CORS
fastify.register(cors, corsOptions);

// Register multipart for file uploads
fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Single file only
  }
});

// Import routes
const jobRoutes = require('./routes/jobs');
const resumeRoutes = require('./routes/resume');
const aiRoutes = require('./routes/ai');
const applicationRoutes = require('./routes/applications');

// Register routes with prefixes
fastify.register(jobRoutes, { prefix: '/api/jobs' });
fastify.register(resumeRoutes, { prefix: '/api/resume' });
fastify.register(aiRoutes, { prefix: '/api/ai' });
fastify.register(applicationRoutes, { prefix: '/api/applications' });

// Health check endpoint
fastify.get('/health', async (request, reply) => {
    return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'AI Job Tracker API',
        version: '1.0.0'
    };
});

// API Documentation endpoint
fastify.get('/docs', async (request, reply) => {
    const docs = {
        name: 'AI Job Tracker API',
        version: '1.0.0',
        endpoints: {
            jobs: {
                GET: '/api/jobs',
                description: 'Get jobs with filters'
            },
            resume: {
                POST: '/api/resume/upload',
                description: 'Upload resume (PDF/TXT)'
            },
            ai: {
                POST: '/api/ai/chat',
                description: 'Chat with AI assistant'
            },
            applications: {
                GET: '/api/applications',
                POST: '/api/applications/track',
                PUT: '/api/applications/:id/status'
            }
        }
    };

    return docs;
});

// 404 Handler
fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`,
        timestamp: new Date().toISOString()
    });
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    reply.status(statusCode).send({
        error: {
            message: message,
            timestamp: new Date().toISOString(),
            path: request.url
        }
    });
});

// Start server
const start = async () => {
    try {
        const port = process.env.PORT || 5000;
        const host = process.env.HOST || '0.0.0.0';

        await fastify.listen({ port, host });

        console.log('='.repeat(50));
        console.log('🚀 AI Job Tracker API Server Started');
        console.log('='.repeat(50));
        console.log(`📡 Server running on: http://${host}:${port}`);
        console.log(`📊 Health check: http://${host}:${port}/health`);
        console.log(`📚 API Docs: http://${host}:${port}/docs`);
        console.log('='.repeat(50));

    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

// Start the server
start();