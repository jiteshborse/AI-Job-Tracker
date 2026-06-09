import { Box, Flex, Center, Spinner } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import JobFeed from './pages/JobFeed';
import Applications from './pages/Applications';
import Auth from './pages/Auth';
import ResumeUploadModal from './components/ResumeUploadModal';
import AIChat from './components/AIChat';
import ApplicationConfirmModal from './components/ApplicationConfirmModal';

function AppContent() {
  const { user, authLoading } = useApp();
  const bgColor = 'gray.50';

  if (authLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Box minH="100vh">
        <Header />
        <Auth />
      </Box>
    );
  }

  return (
    <Box minH="100vh">
      <Header />
      <Flex>
        <Sidebar />
        <Box flex="1" p={6} ml={{ base: 0, md: 64 }}>
          <Routes>
            <Route path="/" element={<JobFeed />} />
            <Route path="/applications" element={<Applications />} />
          </Routes>
        </Box>
        <AIChat />
      </Flex>
      <ResumeUploadModal />
      <ApplicationConfirmModal />
    </Box>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;