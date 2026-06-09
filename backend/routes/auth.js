const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'ai-job-tracker-super-secret-key-12345';

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    try {
        const [salt, originalHash] = storedHash.split(':');
        if (!salt || !originalHash) return false;
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return hash === originalHash;
    } catch (error) {
        return false;
    }
}

async function routes(fastify, options) {
    // Register User
    fastify.post('/register', async (request, reply) => {
        const { email, password, name } = request.body || {};

        if (!email || !password || !name) {
            return reply.code(400).send({
                error: 'Bad Request',
                message: 'Name, email, and password are required'
            });
        }

        if (password.length < 6) {
            return reply.code(400).send({
                error: 'Bad Request',
                message: 'Password must be at least 6 characters long'
            });
        }

        try {
            const existingUser = await db.getUserByEmail(email);
            if (existingUser) {
                return reply.code(400).send({
                    error: 'Bad Request',
                    message: 'A user with this email already exists'
                });
            }

            const passwordHash = hashPassword(password);
            const newUser = await db.createUser({
                name,
                email: email.toLowerCase(),
                passwordHash
            });

            // Sign JWT
            const token = jwt.sign(
                { userId: newUser.id, email: newUser.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return {
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to register user'
            });
        }
    });

    // Login User
    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body || {};

        if (!email || !password) {
            return reply.code(400).send({
                error: 'Bad Request',
                message: 'Email and password are required'
            });
        }

        try {
            const user = await db.getUserByEmail(email);
            if (!user || !verifyPassword(password, user.passwordHash)) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'Invalid email or password'
                });
            }

            // Sign JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return {
                success: true,
                message: 'Logged in successfully',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to login'
            });
        }
    });

    // Get Current User Profile
    fastify.get('/me', async (request, reply) => {
        try {
            if (!request.userId) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'Not authenticated'
                });
            }

            const user = await db.getUserById(request.userId);
            if (!user) {
                return reply.code(404).send({
                    error: 'Not Found',
                    message: 'User not found'
                });
            }

            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to retrieve user profile'
            });
        }
    });
}

module.exports = routes;
