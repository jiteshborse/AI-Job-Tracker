# AI-Powered Job Tracker - Complete Architecture Analysis

## 📋 Table of Contents
1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Frontend-Backend Connections](#frontend-backend-connections)
5. [Data Flow](#data-flow)
6. [Component Interactions](#component-interactions)

---

## Overview

The **AI-Powered Job Tracker** is a full-stack web application that helps job seekers find and track job opportunities using AI-powered resume matching and intelligent recommendations. The application uses a Fastify backend with a React+Vite frontend.

### Tech Stack
- **Backend**: Fastify (Node.js), OpenAI API, Adzuna Job API
- **Frontend**: React, Chakra UI, Vite
- **Storage**: In-memory storage (MemoryStorage class)
- **AI**: OpenAI GPT-3.5-turbo for match scoring and chat

---

## Backend Architecture

### Server Configuration (`server.js`)
**Purpose**: Entry point that initializes and configures the Fastify server
- Sets up logging with `pino-pretty`
- Registers CORS middleware for cross-origin requests
- Registers multipart middleware for file uploads (10MB limit)
- Registers 4 route modules with prefixes
- Provides health check and API documentation endpoints

### Routes Layer
The backend has 4 main route modules, each handling specific functionality:

#### 1. **Jobs Routes** (`routes/jobs.js`) - 237 lines
**What it does**:
- Fetches jobs from Adzuna Job API with fallback to mock jobs
- Implements caching (6-hour TTL) to reduce API calls
- Filters jobs by: role, skills, location, job type, work mode, date posted, match score
- **Core Endpoints**:
  - `GET /api/jobs` - Fetch jobs with filters
  - `GET /api/jobs/health` - Check job API health

**Key Logic**:
```
Request → Check Cache → 
  - If cached: Return cached jobs
  - If not: Fetch from Adzuna API → Store in cache
→ Apply filters (role, skills, location, etc.)
→ Calculate match scores using AI service
→ Return jobs with scores and best matches
```

#### 2. **Resume Routes** (`routes/resume.js`) - 83 lines
**What it does**:
- Handles PDF/TXT resume uploads
- Parses resume content to extract skills and information
- Stores resume in memory storage
- Retrieves stored resume metadata

**Core Endpoints**:
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resume` - Get current resume info

**File Processing**:
- PDF → Uses `pdf-parse` library to extract text
- TXT → Direct text extraction
- Extracts resume info using `FileParser` utility

#### 3. **AI Routes** (`routes/ai.js`) - 31 lines
**What it does**:
- Handles AI chat interactions
- Provides context-aware responses based on user's resume, applications, and filters

**Core Endpoints**:
- `POST /api/ai/chat` - Send query and get AI response

**Context Enhancement**:
```javascript
{
  resumeUploaded: boolean,
  applicationCount: number,
  filters: current user filters
}
```

#### 4. **Applications Routes** (`routes/applications.js`) - 92 lines
**What it does**:
- Tracks user's job applications
- Manages application status (Applied → Interview → Offer → Rejected)
- Provides application statistics

**Core Endpoints**:
- `POST /api/applications/track` - Add new application
- `GET /api/applications` - Get all applications with stats
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/clear` - Clear all applications

---

### Services Layer
The business logic is handled by service classes:

#### 1. **AI Service** (`services/aiService.js`) - 222 lines
**Primary Responsibilities**:

**Match Score Calculation**:
```javascript
calculateMatchScore(resumeText, jobDescription, jobSkills)
  ↓
  - Use fallback scoring first (keyword matching)
  - Try OpenAI for context-aware scoring
  - Average both scores for better accuracy
  - Returns score 0-100
```

**Fallback Scoring Algorithm**:
- Exact skill matches (highest weight)
- Partial matches with keyword proximity
- Case-insensitive comparison
- Returns weighted score

**Match Insights**:
```javascript
calculateMatchInsights(resumeText, job)
  ↓
  - Calculate match score
  - Extract matched/missing skills
  - Generate human-readable summary
  - Returns: {score, matchedSkills, missingSkills, summary}
```

**Chat Handling**:
```javascript
handleChatQuery(query, context)
  ↓
  - Generate responses using OpenAI
  - Provides job search advice
  - Interview preparation tips
  - Resume improvement suggestions
```

#### 2. **Job API Service** (`services/jobApiService.js`) - 212 lines
**Primary Responsibilities**:

**Job Search**:
- Connects to Adzuna Job API
- Handles authentication with API credentials (from .env)
- Transforms Adzuna format to internal format
- Supports filtering: country, keyword, location, job type, permanent/contract

**Job Transformation**:
```
Adzuna Job Format
    ↓
Extract & clean description
    ↓
Extract skills from description
    ↓
Normalize salary info
    ↓
Internal Format {id, title, company, description, location, salary, skills, ...}
```

**Health Check**: Verifies API connectivity and credentials

---

### Storage Layer (`storage.js`)
**Purpose**: In-memory data storage for demo purposes

```javascript
MemoryStorage {
  users: Map          // userId → user data
  applications: Map   // userId → [applications]
  userResumes: Map    // userId → resume text
}
```

**Methods**:
- User management: `setUser()`, `getUser()`
- Resume management: `setResume()`, `getResume()`
- Application management: `addApplication()`, `updateApplicationStatus()`, `getApplications()`, `clearApplications()`

---

### Middleware (`middleware/auth.js`)
**Purpose**: Authentication and CORS configuration

**CORS Options**: Allow all origins for development (headers: Content-Type, Authorization, X-User-Id)

**Demo User Setup**: One demo user pre-configured for testing

---

## Frontend Architecture

### Entry Point (`main.jsx` & `App.jsx`)

#### `main.jsx`
- Mounts React app with Chakra UI Provider
- Initializes theme system

#### `App.jsx`
**Layout Structure**:
```
Box (main container)
  ├─ Header
  ├─ Flex (main layout)
  │  ├─ Sidebar (navigation)
  │  └─ Box (content area)
  │     └─ Routes
  │        ├─ "/" → JobFeed
  │        └─ "/applications" → Applications
  ├─ AIChat (floating chat component)
  ├─ ResumeUploadModal
  └─ ApplicationConfirmModal
```

**App Routing**: Uses React Router v6 with two main pages

---

### State Management (`context/AppContext.jsx`)

**Purpose**: Global state management using React Context API

**State Variables**:
```javascript
{
  jobs: [],              // All jobs from API
  bestMatches: [],       // Top matching jobs
  applications: [],      // User's job applications
  filters: {            // Current search filters
    role: '',
    skills: [],
    location: '',
    jobType: '',
    workMode: '',
    datePosted: 'any',
    matchScore: 'all'
  },
  userResume: null,      // Uploaded resume data
  loading: false,        // Loading state
  showResumeUpload: false,  // Show upload modal
  isFirstLogin: true,    // First time user
  pendingConfirmation: null  // Pending app confirmation
}
```

**Key Functions**:

1. **`fetchJobs(customFilters)`**
   - Calls backend `/api/jobs` with filters
   - Updates jobs and bestMatches state
   - Handles errors with toast notifications

2. **`fetchApplications()`**
   - Calls backend `/api/applications`
   - Updates applications state

3. **`checkResume()`**
   - Calls backend `/api/resume`
   - If no resume: shows upload modal + sets first login
   - If resume exists: loads resume metadata

4. **`uploadResume(file)`**
   - FormData upload to `/api/resume/upload`
   - Updates userResume state
   - Auto-refreshes jobs after upload

5. **`trackApplication(job)`**
   - POST to `/api/applications/track`
   - Adds job to applications list

6. **`updateApplicationStatus(appId, status)`**
   - PUT to `/api/applications/:id/status`
   - Updates application status

7. **`chat(query, context)`**
   - POST to `/api/ai/chat`
   - Gets AI-powered responses

---

### API Service Layer (`services/api.js`)

**Purpose**: Centralized API client using Axios

```javascript
api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {'Content-Type': 'application/json'}
})
```

**API Groups**:

1. **jobApi**
   - `getJobs(filters)` → GET /jobs
   - `getJobById(id)` → GET /jobs/:id

2. **resumeApi**
   - `uploadResume(formData)` → POST /resume/upload
   - `getResume()` → GET /resume

3. **applicationApi**
   - `trackApplication(data)` → POST /applications/track
   - `getApplications(filters)` → GET /applications
   - `updateStatus(appId, status)` → PUT /applications/:id/status
   - `clearApplications(userId)` → DELETE /applications/clear

4. **aiApi**
   - `chat(query, context)` → POST /ai/chat

---

### Pages

#### 1. **JobFeed Page** (`pages/JobFeed.jsx`) - 369 lines
**Purpose**: Main job listing and discovery interface

**Features**:
- Displays all jobs and best matches in grid/list view
- Real-time filters (role, skills, location, job type, date, match score)
- Match score visualization
- Resume requirement indicator
- Application button with confirmation modal
- Auto-refresh every 5 minutes
- Clear filters functionality

**Layout**:
```
Header (filters & view mode toggle)
  ↓
Alert (if first login - show resume prompt)
  ↓
Best Matches Section (top 3-5 jobs)
  ↓
All Jobs Grid/List
  └─ JobCard components
```

#### 2. **Applications Page** (`pages/Applications.jsx`) - 397 lines
**Purpose**: Track job applications and their status

**Features**:
- Table of all applications
- Status filtering (All, Applied, Interview, Offer, Rejected)
- Status update dropdown
- Statistics: total applied, interviews, offers, rejections
- Progress visualization
- Sort by date (newest first)

**Sections**:
```
Statistics Cards (Applied, Interview, Offer, Rejected counts)
  ↓
Status Filter Dropdown
  ↓
Applications Table
  └─ Job Title | Company | Applied Date | Status | Last Updated
```

---

### Components

#### 1. **Header** (`components/Header.jsx`)
- Top navigation bar
- Logo and title
- Dark/Light mode toggle
- Resume status indicator

#### 2. **Sidebar** (`components/Sidebar.jsx`)
- Navigation menu
- Links to JobFeed and Applications pages
- Logo/branding

#### 3. **JobCard** (`components/JobCard.jsx`)
- Individual job display
- Shows: title, company, location, salary, skills
- Match score and progress bar
- Matched/missing skills badges
- "Apply" button
- Company link (if available)

#### 4. **AIChat** (`components/AIChat.jsx`) - 589 lines
**Purpose**: Floating AI assistant for intelligent job search help

**Features**:
- Collapsible chat window
- Message history
- Context-aware responses (uses current filters, resume, applications)
- Pre-built suggestions:
  - Ask about job market
  - Interview tips
  - Resume improvement
  - Skill gaps
- Copy message functionality
- Help modal with example queries
- Typing indicators and loading states

**Message Types**:
- User messages
- Bot responses (with formatting support)
- System messages (greetings, help)

**Context Sent to Backend**:
```javascript
{
  filters: current search filters,
  resumeUploaded: boolean,
  applicationCount: number
}
```

#### 5. **ResumeUploadModal** (`components/ResumeUploadModal.jsx`) - 341 lines
**Purpose**: Modal for resume upload during onboarding

**Features**:
- Drag-and-drop file upload
- File type validation (PDF, TXT only)
- Progress indicator during upload
- Success confirmation
- Locked on first login (must upload to proceed)
- Shows resume metadata after upload

**Validation**:
- File type check (application/pdf or text/plain)
- File size limit (10MB from backend)

#### 6. **ApplicationConfirmModal** (`components/ApplicationConfirmModal.jsx`)
**Purpose**: Confirmation dialog before applying to a job

**Triggered When**: User clicks "Apply" on JobCard

**Shows**:
- Job title and company
- Confirmation message
- Cancel/Confirm buttons

---

### Utilities

#### 1. **Helpers** (`utils/helpers.js`) - 538 lines
**Purpose**: Utility functions for UI and data processing

**Key Functions**:
- `getMatchScoreInfo(score)` - Returns color, label, icon for score visualization
- `calculateSimpleMatchScore()` - Client-side match calculation
- Job formatting utilities
- Date formatting helpers
- Currency formatting

**Match Score Levels**:
```
≥85: Excellent Match (🎯, green)
≥70: High Match (✅, green)
≥50: Medium Match (⚠️, yellow)
≥30: Low Match (🤔, orange)
<30: Poor Match (❌, gray)
```

#### 2. **File Parser** (`backend/utils/fileParser.js`)
**Purpose**: Extract information from resume files

**Extracts**:
- Skills from resume text
- Education info
- Experience/work history
- Contact information

---

## Frontend-Backend Connections

### API Call Sequence Diagram

```
FRONTEND                          BACKEND
   │                                │
   ├─── GET /api/jobs ──────────→ routes/jobs.js
   │    (with filters)            ↓
   │                          Check cache → Fetch from Adzuna
   │                              ↓
   │                          services/aiService.js
   │                          (calculate match scores)
   │    ←──────────────────── Return: jobs + bestMatches
   │
   │
   ├─── POST /api/resume/upload ──→ routes/resume.js
   │    (FormData: file)           ↓
   │                          utils/fileParser.js
   │                          (extract skills)
   │                              ↓
   │                          storage.setResume()
   │    ←──────────────────── Return: upload confirmation
   │
   │
   ├─── POST /api/applications/track ──→ routes/applications.js
   │    (jobId, jobTitle, company)      ↓
   │                                storage.addApplication()
   │    ←──────────────────────────── Return: application object
   │
   │
   ├─── PUT /api/applications/:id/status ──→ routes/applications.js
   │    (new status)                        ↓
   │                                    storage.updateApplicationStatus()
   │    ←──────────────────────────────── Return: updated application
   │
   │
   └─── POST /api/ai/chat ──→ routes/ai.js
        (query, context)        ↓
                            services/aiService.js
                            (OpenAI API call)
        ←──────────────────── Return: AI response
```

---

## Data Flow

### 1. **Initial Load Flow**
```
App Mount
  ↓
AppProvider loads
  ├─ useEffect → checkResume()
  │   ├─ GET /api/resume
  │   ├─ If no resume: setShowResumeUpload(true) + setIsFirstLogin(true)
  │   └─ If resume exists: setUserResume() + setIsFirstLogin(false)
  │
  └─ useEffect → fetchJobs()
      ├─ GET /api/jobs (with userId)
      ├─ Jobs loaded with match scores
      └─ Updated bestMatches list
```

### 2. **Resume Upload Flow**
```
User uploads resume in ResumeUploadModal
  ↓
FormData created (file + userId)
  ↓
POST /api/resume/upload
  ↓
Backend:
  ├─ Parse file (PDF/TXT)
  ├─ Extract skills with FileParser
  ├─ Store in storage.userResumes
  └─ Return: upload confirmation + skills
  ↓
Frontend:
  ├─ Update userResume state
  ├─ Show success toast
  ├─ Close modal
  └─ Auto-call fetchJobs() → Recalculate match scores
```

### 3. **Job Application Flow**
```
User clicks "Apply" on JobCard
  ↓
ApplicationConfirmModal shows
  ↓
User confirms
  ↓
POST /api/applications/track
  {jobId, jobTitle, company}
  ↓
Backend:
  ├─ Validate required fields
  ├─ Create application object
  ├─ Store in storage.applications
  └─ Return: application object
  ↓
Frontend:
  ├─ Add to applications state
  ├─ Show success toast
  ├─ Update applications count in AI chat context
  └─ Can navigate to Applications page
```

### 4. **Status Update Flow**
```
User changes application status in Applications page
  ↓
PUT /api/applications/:id/status
  {status: new status}
  ↓
Backend:
  ├─ Validate status
  ├─ Update in storage
  └─ Return: updated application
  ↓
Frontend:
  ├─ Update applications state
  ├─ Recalculate statistics
  └─ Re-render table
```

### 5. **Job Search with Filters Flow**
```
User changes filters in JobFeed
  ↓
setFilters() called
  ↓
fetchJobs(customFilters) triggered
  ↓
GET /api/jobs?role=X&location=Y&...
  ↓
Backend:
  ├─ Check cache
  ├─ If not cached: Fetch from Adzuna
  ├─ Apply all filters
  ├─ Calculate match scores (with resume)
  ├─ Sort by best matches
  └─ Return: filtered jobs + bestMatches
  ↓
Frontend:
  ├─ Update jobs state
  ├─ Update bestMatches state
  ├─ Re-render JobFeed with new jobs
  └─ Display loading state during fetch
```

### 6. **AI Chat Flow**
```
User types message in AIChat component
  ↓
User clicks send
  ↓
POST /api/ai/chat
  {
    query: user message,
    context: {filters, resumeUploaded, applicationCount}
  }
  ↓
Backend:
  ├─ Get user resume from storage
  ├─ Get user applications from storage
  ├─ Create enhanced context
  ├─ Call aiService.handleChatQuery()
  │   └─ Use OpenAI API to generate response
  └─ Return: response text
  ↓
Frontend:
  ├─ Add user message to messages array
  ├─ Show loading indicator
  ├─ Add bot response to messages array
  ├─ Scroll to latest message
  └─ Store message history
```

---

## Component Interactions

### State Management Flow
```
AppContext (Global State)
    ↓
    ├─→ JobFeed (consumes: jobs, bestMatches, filters, loading, userResume)
    │   └─→ JobCard (displays: job, matchScore)
    │       └─→ triggers: trackApplication()
    │
    ├─→ Applications (consumes: applications)
    │   └─→ triggers: updateApplicationStatus()
    │
    ├─→ AIChat (consumes: filters, userResume, applications)
    │   └─→ triggers: chat()
    │
    ├─→ ResumeUploadModal (consumes: showResumeUpload, userResume)
    │   └─→ triggers: uploadResume()
    │
    └─→ ApplicationConfirmModal (shows pending confirmation)
        └─→ triggers: trackApplication() confirmation
```

### User Interaction Flow
```
1. User visits app
   ↓
2. If no resume: ResumeUploadModal shows (forced)
   ├─ User uploads resume
   └─ Jobs recalculate with match scores
   ↓
3. User browses JobFeed
   ├─ Sees jobs with match scores
   ├─ Can apply to jobs
   └─ Can use filters
   ↓
4. User applies to job
   ├─ Confirmation modal appears
   ├─ Application added to backend storage
   └─ Added to Applications page
   ↓
5. User views Applications page
   ├─ Sees all applications
   ├─ Can filter by status
   └─ Can update status
   ↓
6. User chats with AI
   ├─ Gets job search advice
   ├─ Context includes resume + filters
   └─ Can ask interview/skill questions
   ↓
7. User clears applications (logout)
   ├─ DELETE /api/applications/clear
   └─ Fresh start for next session
```

---

## Technology Integration Points

### External APIs
1. **Adzuna Job API** ← jobApiService.js
   - Real-time job data
   - Search, filter, pagination support
   - Fallback to mock jobs if API fails

2. **OpenAI API** ← aiService.js
   - Match score calculation (context-aware)
   - Chat responses for job search assistance
   - Intelligent recommendations

### Libraries & Dependencies

**Backend**:
- `fastify`: Web framework
- `@fastify/cors`: CORS handling
- `@fastify/multipart`: File upload
- `axios`: HTTP client for APIs
- `pdf-parse`: PDF text extraction
- `mammoth`: DOCX text extraction (optional)
- `openai`: OpenAI SDK
- `dotenv`: Environment variables

**Frontend**:
- `react`: UI library
- `react-router-dom`: Routing
- `chakra-ui`: Component library
- `axios`: HTTP client
- `react-hot-toast`: Toast notifications
- `date-fns`: Date formatting
- `lucide-react`: Icons
- `vite`: Build tool

---

## Security Considerations

1. **File Upload**: Limited to 10MB, validated file types (PDF/TXT only)
2. **CORS**: Currently allows all origins (development mode)
3. **Authentication**: Demo user mode (no real auth yet)
4. **API Keys**: Managed via `.env` file (Adzuna, OpenAI credentials)
5. **Storage**: In-memory only (lost on server restart)

---

## Summary

The **AI Job Tracker** is a well-structured full-stack application with clear separation of concerns:

- **Backend**: Fastify-based API with modular routes, services, and storage
- **Frontend**: React with global state management and component-based UI
- **Connection**: RESTful API with proper error handling and context sharing
- **AI Integration**: OpenAI for intelligent matching and chat assistance
- **Job Source**: Adzuna API with caching and fallback mechanisms

The data flows bidirectionally: Frontend sends requests with filters/context → Backend processes and calculates matches → Frontend displays results. All user interactions trigger appropriate API calls to persist state on the backend.
