const fastify = require('fastify');
const path = require('path');
const fs = require('fs').promises;
const storage = require('../storage');
const FileParser = require('../utils/fileParser');

async function routes(fastify, options) {

    // Upload resume (with file parsing)
    fastify.post('/upload', async (request, reply) => {
        try {
            const data = await request.file();
            const userId = 'demo-user'; // For demo, use fixed user

            if (!data) {
                return reply.code(400).send({
                    error: 'No file uploaded',
                    message: 'Please select a resume file to upload'
                });
            }

            // Read file buffer
            const chunks = [];
            for await (const chunk of data.file) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            // Save file temporarily
            const tempFilePath = path.join(__dirname, '../uploads', `temp_${Date.now()}_${data.filename}`);
            await fs.writeFile(tempFilePath, buffer);

            let resumeText = '';

            // Parse based on file type
            if (data.mimetype === 'application/pdf') {
                const pdf = require('pdf-parse');
                const pdfData = await pdf(buffer);
                resumeText = pdfData.text;
            } else if (data.mimetype === 'text/plain') {
                resumeText = buffer.toString('utf-8');
            } else {
                await fs.unlink(tempFilePath);
                return reply.code(400).send({
                    error: 'Invalid file type',
                    message: 'Only PDF and TXT files are allowed'
                });
            }

            // Clean up temp file
            await fs.unlink(tempFilePath);

            if (!resumeText || resumeText.trim().length === 0) {
                return reply.code(400).send({
                    error: 'Empty file',
                    message: 'The uploaded file appears to be empty'
                });
            }

            // Extract skills
            const extractedInfo = FileParser.extractResumeInfo(resumeText);

            // Create resume object
            const resume = {
                id: `resume_${Date.now()}`,
                userId,
                fileName: data.filename,
                fileType: data.mimetype,
                text: resumeText,
                extractedInfo,
                uploadDate: new Date().toISOString()
            };

            // Store resume
            storage.setResume(userId, resume);

            return {
                success: true,
                message: 'Resume uploaded and parsed successfully',
                resumeId: resume.id,
                textLength: resumeText.length,
                skills: extractedInfo.skills || [],
                skillCount: (extractedInfo.skills || []).length
            };

        } catch (error) {
            console.error('Resume upload error:', error);
            return reply.code(500).send({
                error: 'Resume processing failed',
                message: error.message || 'Failed to process resume file'
            });
        }
    });

    // Get current resume
    fastify.get('/', async (request, reply) => {
        const { userId = 'demo-user' } = request.query;
        const resume = storage.getResume(userId);

        if (!resume) {
            return {
                hasResume: false,
                message: 'No resume uploaded yet'
            };
        }

        return {
            hasResume: true,
            resume: {
                id: resume.id,
                fileName: resume.fileName,
                fileType: resume.fileType,
                uploadDate: resume.uploadDate,
                skills: resume.extractedInfo?.skills || [],
                skillCount: (resume.extractedInfo?.skills || []).length,
                textLength: resume.text?.length || 0
            }
        };
    });
}

module.exports = routes;