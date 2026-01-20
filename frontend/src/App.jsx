import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import JobFeed from './pages/JobFeed';
import Applications from './pages/Applications';
import ResumeUploadModal from './components/ResumeUploadModal';
import AIChat from './components/AIChat';
import ApplicationConfirmModal from './components/ApplicationConfirmModal';

function App() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <AppProvider>
      <Router>
        <Box minH="100vh" bg={bgColor}>
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
      </Router>
    </AppProvider>
  );
}

export default App;