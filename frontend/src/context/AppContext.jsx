import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jobApi, resumeApi, applicationApi } from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [jobs, setJobs] = useState([]);
    const [bestMatches, setBestMatches] = useState([]);
    const [applications, setApplications] = useState([]);
    const [filters, setFilters] = useState({
        role: '',
        skills: [],
        location: '',
        jobType: '',
        workMode: '',
        datePosted: 'any',
        matchScore: 'all'
    });
    const [userResume, setUserResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showResumeUpload, setShowResumeUpload] = useState(false);
    const [isFirstLogin, setIsFirstLogin] = useState(true);
    const [pendingConfirmation, setPendingConfirmation] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);

    // Generate unique session ID for each visit (new session every time)
    const [userId] = useState(() => {
        // Clear any old data on fresh load
        localStorage.clear();
        sessionStorage.clear();
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    });

    // Fetch jobs with filters
    const fetchJobs = async (customFilters = {}, page = 1, append = false) => {
        setLoading(true);
        try {
            // Merge custom filters with current filters
            const allFilters = { ...filters, ...customFilters, userId, page };
            const response = await jobApi.getJobs(allFilters);
            const newJobs = response.data.jobs || [];
            
            // Append jobs if loading more, otherwise replace
            if (append && page > 1) {
                setJobs(prevJobs => [...prevJobs, ...newJobs]);
            } else {
                setJobs(newJobs);
                setCurrentPage(1); // Reset to page 1 on new search
            }
            
            setBestMatches(response.data.bestMatches || []);
            setTotalJobs(response.data.total || newJobs.length);
            if (page === 1) {
                setCurrentPage(1);
            } else {
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    // Load more jobs (next page)
    const loadMoreJobs = async () => {
        const nextPage = currentPage + 1;
        await fetchJobs(filters, nextPage, true); // append = true
    };
    // Fetch applications
    const fetchApplications = async () => {
        try {
            const response = await applicationApi.getApplications({ userId });
            setApplications(response.data.applications || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    // Check for resume on mount
    const checkResume = async () => {
        try {
            const response = await resumeApi.getResume();
            if (response.data.hasResume) {
                setUserResume(response.data);
                setIsFirstLogin(false); // Resume exists, not first login
            } else {
                // Show upload modal if no resume
                setShowResumeUpload(true);
                setIsFirstLogin(true); // No resume, this is first login
            }
        } catch (error) {
            console.error('Error checking resume:', error);
            setIsFirstLogin(true);
        }
    };

    // Upload resume - handles both PDF and TXT
    const uploadResume = async (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('userId', userId);

        try {
            const response = await resumeApi.uploadResume(formData);

            if (response.data.success) {
                const skills = response.data.skills || [];
                setUserResume({
                    hasResume: true,
                    textLength: response.data.textLength || 0,
                    skills: skills
                });
                setShowResumeUpload(false);
                setIsFirstLogin(false); // Resume uploaded, first login complete
                toast.success('Resume uploaded successfully!');
                
                // Fetch jobs based on resume skills - backend will use extracted skills
                fetchJobs(); // No role param - lets backend use resume skills for intelligent search
                return response.data;
            }
        } catch (error) {
            console.error('Error uploading resume:', error);
            toast.error('Failed to upload resume: ' + (error.response?.data?.message || error.message));
            throw error;
        }
    };

    // Track application
    const trackApplication = useCallback((job) => {
        if (!job) return;

        // Set pending confirmation (no localStorage persistence)
        const record = {
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            applyUrl: job.applyUrl,
            timestamp: new Date().toISOString(),
        };

        setPendingConfirmation(record);

        // Open job link in new tab
        if (job.applyUrl) {
            window.open(job.applyUrl, '_blank');
        }

        toast.success('Job link opened. Confirm when you return.');
    }, []);

    // Update application status
    const updateApplicationStatus = async (appId, status) => {
        try {
            await applicationApi.updateStatus(appId, status, userId);
            toast.success('Status updated!');
            fetchApplications();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleApplicationConfirmation = async (action) => {
        if (!pendingConfirmation) return;

        const { jobId, jobTitle, company } = pendingConfirmation;

        if (action === 'yes' || action === 'earlier') {
            const alreadyTracked = applications.some(app => app.jobId === jobId);
            if (!alreadyTracked) {
                try {
                    await applicationApi.trackApplication({
                        userId,
                        jobId,
                        jobTitle,
                        company,
                        status: 'Applied'
                    });
                    toast.success(action === 'earlier' ? 'Saved as applied earlier.' : 'Application saved as Applied.');
                    fetchApplications();
                } catch (error) {
                    console.error('Error saving application:', error);
                    toast.error('Failed to save application');
                }
            }
        }

        // Clear stored data either way
        localStorage.removeItem('lastJobClick');
        setPendingConfirmation(null);
    };

    // Logout function - reset all app state
    const logout = async () => {
        // Reset all state to initial values
        setJobs([]);
        setBestMatches([]);
        setApplications([]);
        setFilters({
            role: '',
            skills: [],
            location: '',
            jobType: '',
            workMode: '',
            datePosted: 'any',
            matchScore: 'all'
        });
        setUserResume(null);
        setLoading(false);
        setIsFirstLogin(true);
        setShowResumeUpload(true);
        
        // Clear any stored data
        localStorage.removeItem('lastJobClick');
        sessionStorage.clear();
        try {
            await applicationApi.clearApplications(userId);
        } catch (error) {
            console.error('Error clearing applications on logout:', error);
        }
        
        toast.success('Logged out successfully!');
    };

    // Initialize - clear session and force new resume upload
    useEffect(() => {
        // Clear any persisted data
        localStorage.clear();
        sessionStorage.clear();
        
        // Start fresh - always show resume upload modal
        setShowResumeUpload(true);
        setIsFirstLogin(true);
        setUserResume(null);
        
        // Fetch initial jobs without resume
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AppContext.Provider value={{
            jobs,
            bestMatches,
            applications,
            filters,
            setFilters,
            userResume,
            loading,
            showResumeUpload,
            setShowResumeUpload,
            isFirstLogin,
            fetchJobs,
            loadMoreJobs,
            currentPage,
            totalJobs,
            uploadResume,
            trackApplication,
            updateApplicationStatus,
            pendingConfirmation,
            handleApplicationConfirmation,
            fetchApplications,
            logout,
            userId
        }}>
            {children}
        </AppContext.Provider>
    );
};