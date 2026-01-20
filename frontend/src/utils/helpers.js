/**
 * Enhanced utility functions for AI Job Tracker
 */

// ==================== MATCH SCORE UTILITIES ====================
export const getMatchScoreInfo = (score) => {
    if (score >= 85) {
        return {
            color: 'green.500',
            label: 'Excellent Match',
            badge: 'green',
            icon: '🎯',
            description: 'Strong alignment with your skills and experience'
        };
    } else if (score >= 70) {
        return {
            color: 'green.400',
            label: 'High Match',
            badge: 'green',
            icon: '✅',
            description: 'Good match with your profile'
        };
    } else if (score >= 50) {
        return {
            color: 'yellow.500',
            label: 'Medium Match',
            badge: 'yellow',
            icon: '⚠️',
            description: 'Moderate match - consider applying'
        };
    } else if (score >= 30) {
        return {
            color: 'orange.500',
            label: 'Low Match',
            badge: 'orange',
            icon: '🤔',
            description: 'Partial match - review requirements'
        };
    } else {
        return {
            color: 'gray.500',
            label: 'Poor Match',
            badge: 'gray',
            icon: '❌',
            description: 'Limited alignment with your profile'
        };
    }
};

export const calculateSimpleMatchScore = (resumeSkills = [], jobSkills = [], jobDescription = '') => {
    if (!jobSkills || jobSkills.length === 0) return 30;

    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    const descriptionLower = jobDescription.toLowerCase();

    // Calculate skill matches
    const exactMatches = resumeSkillsLower.filter(rs =>
        jobSkillsLower.some(js => js.includes(rs) || rs.includes(js))
    );

    // Check for related skills
    const relatedMatches = resumeSkillsLower.filter(rs =>
        jobSkillsLower.some(js =>
            areSkillsRelated(rs, js)
        )
    );

    // Check for skills mentioned in description
    const descriptionMatches = resumeSkillsLower.filter(rs =>
        descriptionLower.includes(rs)
    );

    // Weighted scoring
    const exactScore = (exactMatches.length / jobSkills.length) * 50;
    const relatedScore = (relatedMatches.length / jobSkills.length) * 30;
    const descriptionScore = (descriptionMatches.length / jobSkills.length) * 20;

    const totalScore = exactScore + relatedScore + descriptionScore;
    return Math.min(Math.round(totalScore), 100);
};

const areSkillsRelated = (skill1, skill2) => {
    const relatedGroups = {
        javascript: ['typescript', 'ecmascript', 'es6', 'node', 'react', 'vue', 'angular'],
        react: ['redux', 'context', 'hooks', 'jsx', 'next.js', 'gatsby'],
        python: ['django', 'flask', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
        aws: ['lambda', 's3', 'ec2', 'rds', 'dynamodb', 'cloudformation'],
        docker: ['kubernetes', 'container', 'orchestration', 'devops'],
        mongodb: ['mongoose', 'nosql', 'documentdb'],
        postgresql: ['sql', 'postgres', 'rdbms'],
        graphql: ['apollo', 'relay', 'hasura']
    };

    skill1 = skill1.toLowerCase();
    skill2 = skill2.toLowerCase();

    // Check if skills are directly related
    for (const [main, related] of Object.entries(relatedGroups)) {
        if (skill1 === main && related.includes(skill2)) return true;
        if (skill2 === main && related.includes(skill1)) return true;
    }

    return false;
};

// ==================== DATE & TIME UTILITIES ====================
export const formatDate = (date, format = 'relative') => {
    if (!date) return 'Unknown';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';

    const now = new Date();
    const diffInMs = now - d;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    switch (format) {
        case 'relative':
            if (diffInHours < 1) {
                const minutes = Math.floor(diffInMs / (1000 * 60));
                return minutes < 1 ? 'Just now' : `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            } else if (diffInHours < 24) {
                const hours = Math.floor(diffInHours);
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else if (diffInDays < 7) {
                const days = Math.floor(diffInDays);
                return `${days} day${days > 1 ? 's' : ''} ago`;
            } else if (diffInDays < 30) {
                const weeks = Math.floor(diffInDays / 7);
                return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
            } else {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }

        case 'short':
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        case 'long':
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        case 'datetime':
            return d.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

        default:
            return d.toISOString().split('T')[0];
    }
};

// ==================== TEXT UTILITIES ====================
export const truncateText = (text, maxLength = 150, suffix = '...') => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;

    // Try to break at sentence end
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('. ');
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastPeriod > maxLength * 0.7) {
        return truncated.substring(0, lastPeriod + 1) + suffix;
    } else if (lastSpace > maxLength * 0.7) {
        return truncated.substring(0, lastSpace) + suffix;
    }

    return truncated + suffix;
};

export const highlightKeywords = (text, keywords = [], maxLength = 200) => {
    if (!text || !keywords.length) return truncateText(text, maxLength);

    let highlighted = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });

    return truncateText(highlighted, maxLength);
};

export const extractSkillsFromText = (text) => {
    if (!text) return [];

    const skillPatterns = {
        // Programming Languages
        javascript: ['javascript', 'js', 'es6', 'ecmascript', 'typescript', 'ts'],
        python: ['python', 'py'],
        java: ['java'],
        csharp: ['c#', 'csharp'],
        php: ['php'],
        ruby: ['ruby', 'rails'],
        go: ['golang', 'go'],
        rust: ['rust'],

        // Frontend
        react: ['react', 'reactjs'],
        vue: ['vue', 'vuejs'],
        angular: ['angular'],
        nextjs: ['next.js', 'nextjs'],
        svelte: ['svelte'],

        // Backend
        nodejs: ['node.js', 'nodejs', 'node'],
        express: ['express', 'expressjs'],
        django: ['django'],
        flask: ['flask'],
        spring: ['spring', 'springboot'],

        // Databases
        mongodb: ['mongodb', 'mongo'],
        postgresql: ['postgresql', 'postgres', 'pg'],
        mysql: ['mysql'],
        redis: ['redis'],
        elasticsearch: ['elasticsearch', 'elk'],

        // Cloud & DevOps
        aws: ['aws', 'amazon web services'],
        azure: ['azure'],
        gcp: ['gcp', 'google cloud'],
        docker: ['docker'],
        kubernetes: ['kubernetes', 'k8s'],
        terraform: ['terraform'],
        jenkins: ['jenkins'],

        // Tools & Other
        git: ['git'],
        figma: ['figma'],
        photoshop: ['photoshop'],
        agile: ['agile', 'scrum'],
        jira: ['jira'],
        slack: ['slack']
    };

    const textLower = text.toLowerCase();
    const foundSkills = [];

    Object.entries(skillPatterns).forEach(([skill, patterns]) => {
        if (patterns.some(pattern => textLower.includes(pattern))) {
            foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
    });

    return [...new Set(foundSkills)]; // Remove duplicates
};

// ==================== SALARY UTILITIES ====================
export const formatSalary = (salary) => {
    if (!salary || salary === 'Not specified') return 'Not specified';

    // Handle hourly rates
    if (salary.includes('/hr')) {
        const amount = salary.replace('/hr', '').trim();
        return `$${formatNumber(amount)}/hr`;
    }

    // Handle yearly ranges
    if (salary.includes('-')) {
        const [low, high] = salary.split('-').map(s => s.trim());
        const lowNum = extractNumber(low);
        const highNum = extractNumber(high);

        if (lowNum && highNum) {
            return `$${formatNumber(lowNum)} - $${formatNumber(highNum)}`;
        }
    }

    // Handle single amount
    const amount = extractNumber(salary);
    if (amount) {
        // Determine if it's yearly or monthly based on typical ranges
        if (amount < 1000) {
            return `$${formatNumber(amount)}/hr`;
        } else if (amount < 10000) {
            return `$${formatNumber(amount)}/month`;
        } else {
            return `$${formatNumber(amount)}/year`;
        }
    }

    return salary;
};

const extractNumber = (str) => {
    const match = str.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
};

const formatNumber = (num) => {
    if (typeof num === 'string') num = parseFloat(num.replace(/,/g, ''));
    if (isNaN(num)) return '0';

    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }

    return num.toLocaleString('en-US');
};

// ==================== JOB TYPE UTILITIES ====================
export const getJobTypeInfo = (jobType) => {
    const types = {
        'full-time': { color: 'blue', icon: '💼', label: 'Full Time' },
        'part-time': { color: 'teal', icon: '⏰', label: 'Part Time' },
        'contract': { color: 'orange', icon: '📝', label: 'Contract' },
        'internship': { color: 'purple', icon: '🎓', label: 'Internship' },
        'temporary': { color: 'yellow', icon: '📅', label: 'Temporary' },
        'freelance': { color: 'cyan', icon: '👨‍💻', label: 'Freelance' }
    };

    const key = (jobType || '').toLowerCase().replace(/\s+/g, '-');
    return types[key] || { color: 'gray', icon: '📋', label: jobType || 'Not specified' };
};

export const getWorkModeInfo = (workMode) => {
    const modes = {
        'remote': { color: 'green', icon: '🏠', label: 'Remote' },
        'hybrid': { color: 'blue', icon: '🏢/🏠', label: 'Hybrid' },
        'on-site': { color: 'purple', icon: '🏢', label: 'On-site' },
        'flexible': { color: 'orange', icon: '🔄', label: 'Flexible' }
    };

    const key = (workMode || '').toLowerCase().replace(/\s+/g, '-');
    return modes[key] || { color: 'gray', icon: '📍', label: workMode || 'Not specified' };
};

// ==================== APPLICATION STATUS UTILITIES ====================
export const getApplicationStatusInfo = (status) => {
    const statuses = {
        'applied': {
            color: 'blue',
            icon: '📤',
            label: 'Applied',
            description: 'Application submitted',
            nextStep: 'Wait for response'
        },
        'interview': {
            color: 'yellow',
            icon: '👔',
            label: 'Interview',
            description: 'Interview scheduled',
            nextStep: 'Prepare for interview'
        },
        'offer': {
            color: 'green',
            icon: '🎉',
            label: 'Offer',
            description: 'Job offer received',
            nextStep: 'Review and negotiate'
        },
        'rejected': {
            color: 'red',
            icon: '❌',
            label: 'Rejected',
            description: 'Application not selected',
            nextStep: 'Apply to other jobs'
        },
        'withdrawn': {
            color: 'gray',
            icon: '↩️',
            label: 'Withdrawn',
            description: 'Application withdrawn',
            nextStep: 'Explore other options'
        }
    };

    const key = (status || '').toLowerCase();
    return statuses[key] || {
        color: 'gray',
        icon: '❓',
        label: status || 'Unknown',
        description: 'Status not specified'
    };
};

// ==================== STORAGE UTILITIES ====================
export const setWithExpiry = (key, value, ttlMinutes = 60) => {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + (ttlMinutes * 60 * 1000)
    };
    try {
        localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
        console.error('LocalStorage set error:', error);
    }
};

export const getWithExpiry = (key) => {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const now = new Date();

        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return item.value;
    } catch (error) {
        console.error('LocalStorage get error:', error);
        return null;
    }
};

export const clearExpiredStorage = () => {
    const keysToCheck = ['lastJobClick', 'cachedJobs', 'userFilters'];
    keysToCheck.forEach(key => getWithExpiry(key)); // This will auto-clean expired items
};

// ==================== VALIDATION UTILITIES ====================
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
};

export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// ==================== FILE UTILITIES ====================
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeInfo = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const types = {
        pdf: { color: 'red', icon: '📄', label: 'PDF' },
        txt: { color: 'gray', icon: '📝', label: 'Text' },
        doc: { color: 'blue', icon: '📄', label: 'Word' },
        docx: { color: 'blue', icon: '📄', label: 'Word' },
        jpg: { color: 'orange', icon: '🖼️', label: 'Image' },
        jpeg: { color: 'orange', icon: '🖼️', label: 'Image' },
        png: { color: 'orange', icon: '🖼️', label: 'Image' }
    };
    return types[ext] || { color: 'gray', icon: '📎', label: 'File' };
};

// ==================== DEBOUNCE & THROTTLE ====================
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit = 300) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ==================== MISC UTILITIES ====================
export const generateId = (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        return false;
    }
};

// ==================== EXPORT ALL ====================
export default {
    getMatchScoreInfo,
    calculateSimpleMatchScore,
    formatDate,
    truncateText,
    highlightKeywords,
    extractSkillsFromText,
    formatSalary,
    getJobTypeInfo,
    getWorkModeInfo,
    getApplicationStatusInfo,
    setWithExpiry,
    getWithExpiry,
    clearExpiredStorage,
    isValidEmail,
    isValidPhone,
    isValidUrl,
    formatFileSize,
    getFileTypeInfo,
    debounce,
    throttle,
    generateId,
    sleep,
    copyToClipboard
};