const db = require('./database');

class DatabaseStorageBridge {
    // User methods
    async setUser(userId, data) {
        // Find if user already exists
        const user = await db.getUserById(userId);
        if (user) {
            return user;
        }
        return db.createUser({
            id: userId,
            ...data
        });
    }

    async getUser(userId) {
        return db.getUserById(userId);
    }

    // Resume methods
    async setResume(userId, resume) {
        return db.saveResume(userId, resume);
    }

    async getResume(userId) {
        return db.getResumeByUserId(userId);
    }

    // Application methods
    async addApplication(userId, application) {
        return db.addApplication(userId, application);
    }

    async clearApplications(userId) {
        return db.clearApplications(userId);
    }

    async updateApplicationStatus(userId, appId, status) {
        return db.updateApplicationStatus(userId, appId, status);
    }

    async getApplications(userId) {
        return db.getApplicationsByUserId(userId);
    }

    async deleteApplication(userId, appId) {
        return db.deleteApplication(userId, appId);
    }
}

// Singleton instance
const storage = new DatabaseStorageBridge();

module.exports = storage;