/**
 * Authentication middleware for Fastify
 */

// Demo users
const demoUsers = {
    'demo-user': {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@jobtracker.com',
        role: 'user'
    }
};

// CORS configuration
const corsOptions = {
    origin: '*', // Allow all for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
};

// Simple authentication middleware
const authenticate = async (request, reply) => {
    try {
        const userId = request.headers['x-user-id'] || 'demo-user';
        const user = demoUsers[userId] || demoUsers['demo-user'];

        // Attach user to request
        request.user = user;
        request.userId = user.id;

    } catch (error) {
        console.error('Auth error:', error);
        return reply.code(401).send({
            error: 'Authentication failed',
            message: 'Please provide valid credentials'
        });
    }
};

// File validation middleware
const validateResumeUpload = async (request, reply) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!request.file) {
        return reply.code(400).send({
            error: 'No file uploaded',
            message: 'Please upload a resume file'
        });
    }

    if (!allowedTypes.includes(request.file.mimetype)) {
        return reply.code(400).send({
            error: 'Invalid file type',
            message: 'Only PDF and TXT files are allowed'
        });
    }

    if (request.file.size > maxSize) {
        return reply.code(400).send({
            error: 'File too large',
            message: 'File size must be less than 5MB'
        });
    }
};

module.exports = {
    authenticate,
    corsOptions,
    validateResumeUpload,
    demoUsers
};