const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ai-job-tracker-super-secret-key-12345';

// CORS configuration
const corsOptions = {
    origin: '*', // Allow all for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
};

// JWT-based authentication middleware
const authenticate = async (request, reply) => {
    try {
        const authHeader = request.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({
                error: 'Unauthorized',
                message: 'Access token is missing or invalid'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Attach user ID to request
        request.userId = decoded.userId;
        request.userEmail = decoded.email;

    } catch (error) {
        console.error('Auth error:', error.message);
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Invalid or expired session token'
        });
    }
};

// File validation middleware
const validateResumeUpload = async (request, reply) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB (aligned with server.js limits)

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
            message: 'File size must be less than 10MB'
        });
    }
};

module.exports = {
    authenticate,
    corsOptions,
    validateResumeUpload
};