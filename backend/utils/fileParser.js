/**
 * Enhanced file parsing utilities for resumes
 * Supports PDF, TXT, and DOCX parsing
 */

const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth'); // For DOCX files

class FileParser {
    /**
     * Parse a file based on its type
     * @param {string} filePath - Path to the file
     * @param {string} mimeType - MIME type of the file
     * @returns {Promise<string>} Extracted text content
     */
    static async parseFile(filePath, mimeType) {
        try {
            switch (mimeType) {
                case 'application/pdf':
                    return await this.parsePDF(filePath);

                case 'text/plain':
                    return await this.parseTXT(filePath);

                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    return await this.parseDOCX(filePath);

                default:
                    throw new Error(`Unsupported file type: ${mimeType}`);
            }
        } catch (error) {
            console.error('File parsing error:', error);
            throw new Error(`Failed to parse file: ${error.message}`);
        }
    }

    /**
     * Parse PDF file using pdf-parse
     * @param {string} filePath - Path to PDF file
     * @returns {Promise<string>} Extracted text
     */
    static async parsePDF(filePath) {
        try {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);

            // Clean up the text
            let text = data.text;

            // Remove excessive whitespace
            text = text.replace(/\s+/g, ' ').trim();

            // Remove page numbers and headers/footers
            text = this.cleanText(text);

            return text;
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error(`PDF parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse TXT file
     * @param {string} filePath - Path to TXT file
     * @returns {Promise<string>} File content
     */
    static async parseTXT(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return this.cleanText(content);
        } catch (error) {
            console.error('TXT parsing error:', error);
            throw new Error(`TXT parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse DOCX file using mammoth
     * @param {string} filePath - Path to DOCX file
     * @returns {Promise<string>} Extracted text
     */
    static async parseDOCX(filePath) {
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            return this.cleanText(result.value);
        } catch (error) {
            console.error('DOCX parsing error:', error);
            throw new Error(`DOCX parsing failed: ${error.message}`);
        }
    }

    /**
     * Clean and normalize text
     * @param {string} text - Raw text
     * @returns {string} Cleaned text
     */
    static cleanText(text) {
        if (!text) return '';

        // Remove non-printable characters
        text = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');

        // Normalize line endings
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // Remove multiple consecutive spaces
        text = text.replace(/\s+/g, ' ');

        // Remove page numbers (e.g., "Page 1 of 3")
        text = text.replace(/Page\s+\d+\s+of\s+\d+/gi, ' ');

        // Remove common resume headers/footers
        const patterns = [
            /©\s*\d{4}/g,
            /Confidential/g,
            /Resume\s*of/g,
            /Curriculum\s*Vitae/g,
            /-\s*\d+\s*-/g, // Page numbers like "- 1 -"
            /http[s]?:\/\/[^\s]+/g, // URLs
            /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g // Email addresses (for privacy)
        ];

        patterns.forEach(pattern => {
            text = text.replace(pattern, ' ');
        });

        return text.trim();
    }

    /**
     * Extract key information from resume text
     * @param {string} text - Resume text
     * @returns {object} Structured resume data
     */
    static extractResumeInfo(text) {
        const info = {
            skills: [],
            experience: [],
            education: [],
            contact: {},
            summary: ''
        };

        // Extract email
        const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/);
        if (emailMatch) {
            info.contact.email = emailMatch[0];
        }

        // Extract phone number (basic pattern)
        const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/g);
        if (phoneMatch) {
            info.contact.phone = phoneMatch[0];
        }

        // Extract LinkedIn profile
        const linkedinMatch = text.match(/linkedin\.com\/in\/[A-Za-z0-9\-_]+/gi);
        if (linkedinMatch) {
            info.contact.linkedin = linkedinMatch[0];
        }

        // Extract skills (common tech skills)
        const commonSkills = [
            'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
            'HTML', 'CSS', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
            'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'REST API',
            'GraphQL', 'Express', 'Next.js', 'Vue.js', 'Angular', 'Redux',
            'Jest', 'Testing', 'Agile', 'Scrum', 'DevOps', 'Linux', 'Windows'
        ];

        info.skills = commonSkills.filter(skill =>
            new RegExp(`\\b${skill}\\b`, 'i').test(text)
        );

        // Extract experience years (simple pattern)
        const expMatch = text.match(/(\d+)\+?\s*(years?|yrs?)/i);
        if (expMatch) {
            info.experienceYears = parseInt(expMatch[1]);
        }

        // Extract education (simple pattern for degrees)
        const degreePatterns = [
            /(Bachelor|B\.?S\.?|B\.?A\.?|B\.?Tech)/i,
            /(Master|M\.?S\.?|M\.?A\.?|M\.?Tech)/i,
            /(PhD|Doctorate|Ph\.?D\.?)/i
        ];

        degreePatterns.forEach(pattern => {
            const match = text.match(pattern);
            if (match) {
                info.education.push(match[1]);
            }
        });

        // Get first 500 characters as summary
        info.summary = text.substring(0, 500) + (text.length > 500 ? '...' : '');

        return info;
    }

    /**
     * Calculate file hash for deduplication
     * @param {string} filePath - Path to file
     * @returns {Promise<string>} MD5 hash
     */
    static async calculateFileHash(filePath) {
        const crypto = require('crypto');
        const fileBuffer = await fs.readFile(filePath);
        const hash = crypto.createHash('md5');
        hash.update(fileBuffer);
        return hash.digest('hex');
    }

    /**
     * Validate file before parsing
     * @param {string} filePath - Path to file
     * @param {string} mimeType - MIME type
     * @returns {Promise<object>} Validation result
     */
    static async validateFile(filePath, mimeType) {
        const stats = await fs.stat(filePath);

        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'application/pdf',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        const validation = {
            isValid: true,
            errors: [],
            fileSize: stats.size,
            fileType: mimeType
        };

        // Check file size
        if (stats.size > maxSize) {
            validation.isValid = false;
            validation.errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
        }

        // Check file type
        if (!allowedTypes.includes(mimeType)) {
            validation.isValid = false;
            validation.errors.push('File type not supported. Use PDF, TXT, or DOCX');
        }

        // Check if file is empty
        if (stats.size === 0) {
            validation.isValid = false;
            validation.errors.push('File is empty');
        }

        // Check file extension matches MIME type
        const extension = path.extname(filePath).toLowerCase();
        const expectedExtensions = {
            'application/pdf': '.pdf',
            'text/plain': '.txt',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
        };

        if (expectedExtensions[mimeType] && extension !== expectedExtensions[mimeType]) {
            validation.errors.push(`File extension ${extension} doesn't match MIME type ${mimeType}`);
        }

        return validation;
    }

    /**
     * Generate a resume fingerprint for matching
     * @param {string} text - Resume text
     * @returns {string} Fingerprint string
     */
    static generateFingerprint(text) {
        // Extract key sections for fingerprinting
        const lines = text.split('\n');

        // Get first 10 non-empty lines
        const keyLines = lines
            .filter(line => line.trim().length > 0)
            .slice(0, 10)
            .map(line => line.trim().substring(0, 50)); // Take first 50 chars of each line

        return keyLines.join('|').toLowerCase();
    }

    /**
     * Calculate text statistics
     * @param {string} text - Resume text
     * @returns {object} Text statistics
     */
    static getTextStats(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

        return {
            wordCount: words.length,
            sentenceCount: sentences.length,
            avgWordLength: words.length > 0
                ? words.reduce((sum, word) => sum + word.length, 0) / words.length
                : 0,
            uniqueWords: new Set(words.map(w => w.toLowerCase())).size,
            charCount: text.length
        };
    }
}

module.exports = FileParser;