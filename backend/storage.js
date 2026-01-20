// Simple in-memory storage for demo
class MemoryStorage {
    constructor() {
        this.users = new Map(); // userId -> user data
        this.applications = new Map(); // userId -> applications array
        this.userResumes = new Map(); // userId -> resume text
    }

    // User methods
    setUser(userId, data) {
        this.users.set(userId, { ...data, id: userId });
    }

    getUser(userId) {
        return this.users.get(userId);
    }

    // Resume methods
    setResume(userId, resumeText) {
        this.userResumes.set(userId, resumeText);
    }

    getResume(userId) {
        return this.userResumes.get(userId);
    }

    // Application methods
    addApplication(userId, application) {
        const userApps = this.applications.get(userId) || [];
        const newApp = {
            id: Date.now().toString(),
            ...application,
            createdAt: new Date().toISOString(),
            status: 'Applied'
        };
        userApps.push(newApp);
        this.applications.set(userId, userApps);
        return newApp;
    }

    clearApplications(userId) {
        this.applications.set(userId, []);
    }

    updateApplicationStatus(userId, appId, status) {
        const userApps = this.applications.get(userId) || [];
        const appIndex = userApps.findIndex(app => app.id === appId);
        if (appIndex !== -1) {
            userApps[appIndex].status = status;
            userApps[appIndex].updatedAt = new Date().toISOString();
            this.applications.set(userId, userApps);
            return userApps[appIndex];
        }
        return null;
    }

    getApplications(userId) {
        return this.applications.get(userId) || [];
    }
}

// Singleton instance
const storage = new MemoryStorage();

// Create a demo user for testing
storage.setUser('demo-user', {
    name: 'Demo User',
    email: 'demo@example.com'
});

module.exports = storage;