const fs = require('fs').promises;
const path = require('path');

class JSONDatabase {
    constructor() {
        this.dataDir = path.join(__dirname, 'data');
        this.usersFile = path.join(this.dataDir, 'users.json');
        this.resumesFile = path.join(this.dataDir, 'resumes.json');
        this.applicationsFile = path.join(this.dataDir, 'applications.json');
    }

    /**
     * Initialize the database structure
     */
    async init() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            await this._ensureFile(this.usersFile, []);
            await this._ensureFile(this.resumesFile, []);
            await this._ensureFile(this.applicationsFile, []);
            console.log('💾 Persistent JSON Database Initialized Successfully');
        } catch (e) {
            console.error('Failed to initialize JSON database:', e);
        }
    }

    /**
     * Ensure a database file exists, write default content if not
     */
    async _ensureFile(filePath, defaultData) {
        try {
            await fs.access(filePath);
        } catch {
            await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
        }
    }

    /**
     * Read parsed content from a JSON file
     */
    async _read(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`Error reading database file ${filePath}:`, error);
            return [];
        }
    }

    /**
     * Write raw JavaScript objects as JSON data
     */
    async _write(filePath, data) {
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error(`Error writing database file ${filePath}:`, error);
            throw error;
        }
    }

    // ==========================================
    // User Operations
    // ==========================================
    async getUsers() {
        return this._read(this.usersFile);
    }

    async getUserById(id) {
        const users = await this.getUsers();
        return users.find(u => u.id === id) || null;
    }

    async getUserByEmail(email) {
        const users = await this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    async createUser(user) {
        const users = await this.getUsers();
        const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            ...user
        };
        users.push(newUser);
        await this._write(this.usersFile, users);
        return newUser;
    }

    // ==========================================
    // Resume Operations
    // ==========================================
    async getResumeByUserId(userId) {
        const resumes = await this._read(this.resumesFile);
        return resumes.find(r => r.userId === userId) || null;
    }

    async saveResume(userId, resumeData) {
        const resumes = await this._read(this.resumesFile);
        const index = resumes.findIndex(r => r.userId === userId);
        
        const resumeRecord = {
            id: resumeData.id || `resume_${Date.now()}`,
            userId,
            fileName: resumeData.fileName,
            fileType: resumeData.fileType,
            text: resumeData.text,
            extractedInfo: resumeData.extractedInfo,
            uploadDate: resumeData.uploadDate || new Date().toISOString()
        };

        if (index !== -1) {
            resumes[index] = resumeRecord;
        } else {
            resumes.push(resumeRecord);
        }

        await this._write(this.resumesFile, resumes);
        return resumeRecord;
    }

    // ==========================================
    // Application Operations
    // ==========================================
    async getApplicationsByUserId(userId) {
        const apps = await this._read(this.applicationsFile);
        return apps.filter(a => a.userId === userId);
    }

    async addApplication(userId, appData) {
        const apps = await this._read(this.applicationsFile);
        const newApp = {
            id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            jobId: appData.jobId,
            jobTitle: appData.jobTitle,
            company: appData.company,
            status: appData.status || 'Applied',
            appliedDate: appData.appliedDate || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        apps.push(newApp);
        await this._write(this.applicationsFile, apps);
        return newApp;
    }

    async updateApplicationStatus(userId, appId, status) {
        const apps = await this._read(this.applicationsFile);
        const index = apps.findIndex(a => a.id === appId && a.userId === userId);
        if (index !== -1) {
            apps[index].status = status;
            apps[index].updatedAt = new Date().toISOString();
            await this._write(this.applicationsFile, apps);
            return apps[index];
        }
        return null;
    }

    async clearApplications(userId) {
        const apps = await this._read(this.applicationsFile);
        const remainingApps = apps.filter(a => a.userId !== userId);
        await this._write(this.applicationsFile, remainingApps);
    }

    async deleteApplication(userId, appId) {
        const apps = await this._read(this.applicationsFile);
        const index = apps.findIndex(a => a.id === appId && a.userId === userId);
        if (index !== -1) {
            apps.splice(index, 1);
            await this._write(this.applicationsFile, apps);
            return true;
        }
        return false;
    }
}

const db = new JSONDatabase();
module.exports = db;
