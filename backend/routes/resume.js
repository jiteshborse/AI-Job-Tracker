const fastify = require('fastify');
const path = require('path');
const fs = require('fs').promises;
const storage = require('../storage');
const FileParser = require('../utils/fileParser');

async function routes(fastify, options) {

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads');
    try {
        await fs.mkdir(uploadsDir, { recursive: true });
    } catch (error) {
        console.warn('Could not create uploads directory:', error.message);
    }

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

            console.log(`📄 Uploading file: ${data.filename} (${data.mimetype})`);

            // Read file buffer
            const chunks = [];
            for await (const chunk of data.file) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            console.log(`📊 File size: ${buffer.length} bytes`);

            let resumeText = '';
            let tempFilePath;

            try {
                // Save file temporarily
                tempFilePath = path.join(__dirname, '../uploads', `temp_${Date.now()}_${data.filename}`);
                await fs.writeFile(tempFilePath, buffer);
                console.log(`💾 Temporary file saved to: ${tempFilePath}`);

                // Parse based on file type
                if (data.mimetype === 'application/pdf') {
                    console.log('📕 Parsing PDF...');
                    const pdf = require('pdf-parse');
                    try {
                        const pdfData = await pdf(buffer);
                        resumeText = pdfData.text;
                        console.log(`✅ PDF parsed successfully. Text length: ${resumeText.length}`);
                    } catch (pdfError) {
                        console.error('❌ PDF parsing failed:', pdfError.message);
                        throw new Error(`PDF parsing failed: ${pdfError.message}`);
                    }
                } else if (data.mimetype === 'text/plain') {
                    console.log('📄 Parsing TXT...');
                    resumeText = buffer.toString('utf-8');
                    console.log(`✅ TXT parsed successfully. Text length: ${resumeText.length}`);
                } else {
                    await fs.unlink(tempFilePath);
                    return reply.code(400).send({
                        error: 'Invalid file type',
                        message: `Only PDF and TXT files are allowed. Received: ${data.mimetype}`
                    });
                }

                // Clean up temp file
                if (tempFilePath) {
                    try {
                        await fs.unlink(tempFilePath);
                        console.log('🗑️ Temporary file cleaned up');
                    } catch (cleanupError) {
                        console.warn('⚠️ Could not clean up temp file:', cleanupError.message);
                    }
                }

                if (!resumeText || resumeText.trim().length === 0) {
                    return reply.code(400).send({
                        error: 'Empty file',
                        message: 'The uploaded file appears to be empty'
                    });
                }

                // Extract skills
                console.log('🔍 Extracting resume information...');
                const extractedInfo = FileParser.extractResumeInfo(resumeText);
                console.log(`✅ Found ${extractedInfo.skills?.length || 0} skills`);

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
                console.log(`💾 Resume stored for user: ${userId}`);

                return {
                    success: true,
                    message: 'Resume uploaded and parsed successfully',
                    resumeId: resume.id,
                    textLength: resumeText.length,
                    skills: extractedInfo.skills || [],
                    skillCount: (extractedInfo.skills || []).length
                };

            } catch (parseError) {
                console.error('❌ Parse error:', parseError.message);
                // Clean up temp file if it exists
                if (tempFilePath) {
                    try {
                        await fs.unlink(tempFilePath);
                    } catch (e) {
                        console.warn('Could not clean up temp file:', e.message);
                    }
                }
                throw parseError;
            }

        } catch (error) {
            console.error('❌ Resume upload error:', error);
            return reply.code(500).send({
                error: 'Resume processing failed',
                message: error.message || 'Failed to process resume file',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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