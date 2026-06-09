# 🎯 AI Job Tracker

An intelligent job tracking application powered by AI that helps you find, match, and manage your job applications. Upload your resume once, and let AI analyze how well you match with real job listings from the market.

## ✨ Features

### 🤖 AI-Powered Matching
- **Resume Analysis**: Upload PDF/TXT resume and get AI-powered skill extraction
- **Smart Match Scoring**: AI calculates match percentage between your resume and job requirements
- **Skill-Based Recommendations**: Get personalized job recommendations based on your tech stack
- **Matched Skills Highlighting**: See which of your skills align with each job posting

### 📊 Job Discovery
- **Real-Time Job Listings**: Fetches jobs from Adzuna API with 6-hour caching
- **Advanced Filtering**: Filter by role, location, job type, work mode, date posted, and match score
- **Best Matches Section**: Top 8 recommended jobs based on your resume
- **Active Filters Display**: Visual badges showing applied filters on each job card

### 💬 Interactive AI Assistant
- **ChatGPT-Style Interface**: Streaming text responses with character-by-character animation
- **Context-Aware Help**: Intelligent fallback responses when OpenAI is unavailable
- **Quick Start Questions**: Pre-built questions to help you get started
- **Copy Responses**: One-click copy for AI assistant responses

### 📝 Application Tracking
- **Track Applications**: Click "Apply" to open job links and track your applications
- **Status Management**: Update application status (Applied, Interview, Offer, Rejected)
- **Application Confirmation**: Prompt after returning from external job sites
- **Application History**: View all tracked applications in one place

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Chakra UI Components**: Beautiful, accessible component library
- **Salary Formatting**: Smart salary display with currency formatting
- **Date Formatting**: Human-readable relative dates (e.g., "2 days ago")
- **Color-Coded Match Badges**: Visual indicators for high/medium/low matches

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Chakra UI** - Component library for React
- **React Hot Toast** - Elegant toast notifications
- **Axios** - HTTP client for API requests
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Fastify** - Fast and low overhead web framework
- **OpenAI API** - AI-powered resume matching and chat assistance
- **Adzuna API** - Real job listings from the market
- **PDF-Parse** - PDF resume text extraction
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### APIs & Services
- **Adzuna Jobs API** - Live job market data
- **OpenAI GPT-3.5 Turbo** - AI matching and chat
- **In-Memory Storage** - Fast demo data persistence

## 📁 Project Structure

```
ai-job-tracker/
├── backend/
│   ├── server.js              # Main Fastify server
│   ├── storage.js             # In-memory data storage
│   ├── mockJobs.js            # Fallback mock data
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── routes/
│   │   ├── jobs.js            # Job search and filtering
│   │   ├── applications.js    # Application tracking
│   │   ├── resume.js          # Resume upload and parsing
│   │   └── ai.js              # AI chat assistant
│   ├── services/
│   │   ├── jobApiService.js   # Adzuna API integration
│   │   └── aiService.js       # OpenAI integration
│   └── utils/
│       └── fileParser.js      # PDF/TXT parsing
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # React entry point
│   │   ├── components/
│   │   │   ├── Header.jsx     # Top navigation
│   │   │   ├── Sidebar.jsx    # Filter sidebar
│   │   │   ├── JobCard.jsx    # Job listing card
│   │   │   ├── AIChat.jsx     # Chat interface
│   │   │   └── ResumeUploadModal.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx # Global state
│   │   ├── pages/
│   │   │   ├── JobFeed.jsx    # Main job listings
│   │   │   └── Applications.jsx # Tracked apps
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   └── utils/
│   │       └── helpers.js     # Utility functions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- Adzuna API credentials (app_id & app_key)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-job-tracker
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Create `.env` file in backend folder**
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
ADZUNA_COUNTRY=us

```

Alternatively, copy the sample file:

```bash
cd backend
copy .env.example .env
```

Never commit `.env` to GitHub. Use `.env.example` for placeholders.

4. **Frontend Setup**
```bash
cd ../frontend
npm install
```

5. **Start the Backend Server**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

6. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

## ☁️ Deploy to Vercel (Frontend)

You can deploy the React frontend to Vercel and point it at your hosted backend.

### Option A: Frontend on Vercel, Backend on Render/Railway (Recommended)
1. Deploy backend (Fastify) to a Node host like Render/Railway/Fly.io.
2. Copy the backend URL and set it as `VITE_API_URL` in Vercel Project Settings → Environment Variables.
3. In this repo, the frontend has a Vercel config at `frontend/vercel.json`.
4. In Vercel, create a new project and set "Root Directory" to `frontend/`.
5. Build command: `npm run build`, Output directory: `dist` (already configured).
6. Trigger Deploy. The app will call your backend via `VITE_API_URL`.

### Option B: Both on Vercel (requires adapting Fastify to Serverless)
- Vercel Serverless Functions require an API entry in `/api/*.js` style. Fastify needs a wrapper or route migration.
- If you want this path, open an issue and we’ll create a serverless function adapter for the existing routes.

### Environment Variables on Vercel
- Set in Project Settings → Environment Variables:
	- `VITE_API_URL=https://your-backend-host.example.com/api`
- Re-deploy after changing environment variables.

## 🔑 API Keys Setup

### Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign up/Login and go to API Keys
3. Create a new secret key
4. Add to `.env` as `GEMINI_API_KEY`

### Adzuna API Credentials
1. Visit [Adzuna Developer Portal](https://developer.adzuna.com/)
2. Sign up for a free account
3. Create an application
4. Copy `Application ID` and `Application Key`
5. Add to `.env` as `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`

## 🎯 How It Works

1. **Upload Resume**: On first visit, upload your resume (PDF or TXT)
2. **AI Processing**: Backend extracts skills from your resume using pattern matching
3. **Job Fetching**: System fetches real jobs from Adzuna API based on your profile
4. **Smart Matching**: AI calculates match scores by comparing resume skills with job requirements
5. **Recommendations**: Top matches are displayed with match percentages and skill highlights
6. **Apply & Track**: Click apply to open job links, confirm applications when you return
7. **Chat Assistant**: Ask AI questions about jobs, resume tips, or interview preparation

## 📊 Key Features Explained

### Resume-Based Matching
- Extracts 50+ common tech skills from resume (JavaScript, React, Python, AWS, etc.)
- Uses word-boundary regex matching for accuracy
- Weighs exact matches higher than partial matches
- Minimum 25% score to ensure quality recommendations

### Job Skill Extraction
- Scans job descriptions for tech stack mentions
- Identifies frameworks, languages, databases, cloud services
- Matches job requirements with resume skills
- Shows matched vs missing skills

### Intelligent Caching
- API responses cached for 6 hours
- Reduces API calls and improves performance
- Cache invalidated on filter changes
- Separate cache keys for different search criteria

### Fallback Systems
- OpenAI fallback: Uses keyword matching if API fails
- Adzuna fallback: Uses mock jobs if API unavailable
- Smart error handling with user-friendly messages

## 🎨 UI Components

- **Header**: Navigation with logout functionality
- **Sidebar**: Advanced filtering with emoji icons
- **JobCard**: Rich job display with salary, skills, match score
- **AIChat**: Interactive chat with streaming responses
- **ResumeUploadModal**: First-login resume upload flow
- **ApplicationTracker**: Status management for tracked jobs

## 🔧 Configuration

### Backend Port
Default: `5000` (configurable in `.env`)

### Frontend Port
Default: `3000` (configurable in `vite.config.js`)

### Cache Duration
Default: `6 hours` (configurable in `backend/routes/jobs.js`)

### Results Per Page
Default: `30 jobs` (configurable in API service)

## 🚧 Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server with HMR
```

### Build for Production
```bash
cd frontend
npm run build  # Creates optimized production build
```

## 🐛 Known Limitations

- **Session Persistence**: Page reload resets session (by design for demo)
- **In-Memory Storage**: Data lost on server restart
- **Demo User**: Uses single demo user ID for all sessions
- **API Rate Limits**: Adzuna free tier has usage limits
- **OpenAI Costs**: GPT-3.5 API calls incur costs

## 🔜 Future Enhancements

- [ ] User authentication with persistent sessions
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Email notifications for new matching jobs
- [ ] Resume builder/editor
- [ ] Interview preparation tools
- [ ] Salary negotiation insights
- [ ] Company research integration
- [ ] Calendar integration for interview scheduling
- [ ] Chrome extension for quick job saving
- [ ] Mobile app (React Native)

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built with ❤️ using React, Node.js, and AI

---

**Note**: This is a demo application. For production use, implement proper authentication, database storage, and security measures.