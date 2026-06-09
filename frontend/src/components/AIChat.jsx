import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  IconButton,
  Badge,
  CloseButton,
  Fade,
  ScaleFade,
  Textarea,
  useToast,
  Spinner,
  InputGroup,
  Tooltip,
  useDisclosure,
  Kbd
} from '@chakra-ui/react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  Sparkles,
  Search,
  HelpCircle,
  Zap,
  Copy,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  MessageCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiApi } from '../services/api';

const AIChat = () => {
  const { filters, userResume, applications, user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm your AI Job Assistant, powered by advanced language models. I can help you:\n\n• Find relevant jobs based on your resume\n• Explain match scores and recommendations\n• Answer questions about job searching\n• Suggest interview preparation tips\n\nWhat would you like to know?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'greeting'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copied, setCopied] = useState(null);
  const toast = useToast();
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const chatBg = 'rgba(255, 255, 255, 0.9)';
  const borderColor = 'rgba(226, 232, 240, 0.8)';
  const botBg = '#ede9fe'; // premium violet-50/100 tint
  const userBg = '#eff6ff'; // premium slate/blue-50 tint
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);
  
  const quickQuestions = [
    { icon: Search, text: "🔍 Remote React jobs", query: "Show me remote React developer jobs" },
    { icon: TrendingUp, text: "📈 Best matches", query: "Find jobs with high match scores for my profile" },
    { icon: HelpCircle, text: "❓ How match works?", query: "Explain how job match scores are calculated" },
    { icon: Lightbulb, text: "💡 Interview tips", query: "Give me interview preparation tips for tech jobs" },
  ];
  
  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'question'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setStreamingText('');
    
    try {
      // Prepare context for AI
      const context = {
        filters: Object.entries(filters)
          .filter(([_, value]) => value && (Array.isArray(value) ? value.length > 0 : true))
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(' | '),
        resumeUploaded: !!userResume,
        applicationCount: applications.length,
        resumeSkills: userResume?.skills || []
      };
      
      // Call AI API
      const response = await aiApi.chat(text, context);
      const responseText = response.data.response;
      
      // Simulate streaming effect (character by character)
      const botMessageId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: botMessageId,
        text: '',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'response',
        isStreaming: true
      }]);
      
      // Stream text character by character
      let displayedText = '';
      for (let i = 0; i < responseText.length; i++) {
        displayedText += responseText[i];
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: displayedText }
              : msg
          )
        );
        await new Promise(resolve => setTimeout(resolve, 8)); // 8ms delay per character for snappy speed
      }
      
      // Mark as finished streaming
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Intelligent fallback responses
      let fallbackResponse = "I'm here to help! ";
      
      if (text.toLowerCase().includes('remote') || text.toLowerCase().includes('location')) {
        fallbackResponse = "📍 You can filter jobs by location using the sidebar. Select 'Remote' in the Work Mode filter to see remote positions.";
      } else if (text.toLowerCase().includes('resume') || text.toLowerCase().includes('upload')) {
        fallbackResponse = "📄 Click the 'Upload Resume' button in the header to get started. Drag and drop your PDF or DOC file for resume parsing.";
      } else if (text.toLowerCase().includes('application') || text.toLowerCase().includes('track')) {
        fallbackResponse = "📋 You can view all your applications by clicking 'Applications' in the navigation menu. Track your progress for each job.";
      } else if (text.toLowerCase().includes('match') || text.toLowerCase().includes('score')) {
        fallbackResponse = "🎯 Match scores (0-100%) are calculated based on:\n• Skills alignment with job requirements\n• Experience level matching\n• Location preferences\n\nHigher scores = better job fit!";
      } else if (text.toLowerCase().includes('salary') || text.toLowerCase().includes('pay')) {
        fallbackResponse = "💰 Use the salary filter to set your preferred range. We show competitive salaries with each job listing.";
      } else {
        fallbackResponse += "Try asking about jobs, resume upload, match scores, or your applications!";
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'response',
        isError: true
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: '⚠️ Using Quick Response',
        description: 'AI service unavailable, showing helpful tips instead',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  };
  
  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };
  
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({
      title: '✓ Copied',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    setTimeout(() => setCopied(null), 2000);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! 👋 I'm your AI Job Assistant, powered by advanced language models. How can I help you today?",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'greeting'
      }
    ]);
    
    toast({
      title: '🗑️ Chat cleared',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Box position="fixed" bottom="6" right="6" zIndex="2000">
          <ScaleFade in={!isOpen}>
            <Button
              leftIcon={<Sparkles size={18} />}
              bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
              color="white"
              size="lg"
              onClick={() => setIsOpen(true)}
              shadow="0 8px 25px rgba(99, 102, 241, 0.35)"
              borderRadius="full"
              px={6}
              _hover={{
                transform: 'translateY(-3px) scale(1.03)',
                shadow: '0 12px 30px rgba(99, 102, 241, 0.45)'
              }}
              _active={{
                transform: 'scale(0.98)'
              }}
              position="relative"
            >
              <Box 
                position="absolute"
                top="-1.5px"
                right="-1.5px"
                w="12px"
                h="12px"
                bg="green.400"
                borderRadius="full"
                border="2px solid white"
              />
              AI Assistant
            </Button>
          </ScaleFade>
        </Box>
      )}
      
      {/* Chat Window */}
      {isOpen && (
        <Fade in={isOpen}>
          <Box
            position="fixed"
            bottom="6"
            right="6"
            width={{ base: 'calc(100vw - 48px)', md: '420px' }}
            height="620px"
            maxHeight="calc(100vh - 120px)"
            bg={chatBg}
            backdropFilter="blur(16px)"
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            shadow="0 15px 40px rgba(0, 0, 0, 0.08)"
            display="flex"
            flexDirection="column"
            zIndex="2001"
            overflow="hidden"
            isolation="isolate"
            className="scale-in"
          >
          {/* Chat Header */}
          <Flex 
            p={4} 
            alignItems="center"
            justifyContent="space-between"
            bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
            color="white"
            shadow="sm"
          >
            <Flex alignItems="center" gap={3}>
              <Avatar 
                size="sm" 
                icon={<Bot size={18} />}
                bg="white"
                color="#6366f1"
                shadow="sm"
              />
              <Box>
                <Heading size="xs" fontWeight="800" fontFamily="'Plus Jakarta Sans', sans-serif">AI Job Assistant</Heading>
                <Text fontSize="10px" opacity={0.8}>
                  Powered by Gemini LLM
                </Text>
              </Box>
              <Badge bg="whiteAlpha.300" color="white" fontSize="9px" borderRadius="full" px={2} py={0.5}>
                Online
              </Badge>
            </Flex>
            
            <HStack spacing={1}>
              <IconButton
                icon={<Zap size={15} />}
                size="xs"
                variant="ghost"
                color="white"
                onClick={clearChat}
                aria-label="Clear chat"
                _hover={{ bg: 'whiteAlpha.200' }}
                borderRadius="lg"
              />
              <CloseButton 
                size="sm" 
                onClick={() => setIsOpen(false)}
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                borderRadius="full"
              />
            </HStack>
          </Flex>
          
          {/* Messages Container */}
          <Box flex="1" overflowY="auto" p={4} css={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' }
          }}>
            <VStack spacing={4} align="stretch">
              {messages.map((msg) => (
                <Flex
                  key={msg.id}
                  direction={msg.sender === 'user' ? 'row-reverse' : 'row'}
                  gap={2.5}
                  maxWidth="90%"
                  alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <Avatar
                    size="xs"
                    name={msg.sender === 'user' ? user?.name : undefined}
                    icon={msg.sender !== 'user' ? <Bot size={12} /> : undefined}
                    bg={msg.sender === 'user' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent'}
                    color="white"
                    border={msg.sender !== 'user' ? '1px solid' : 'none'}
                    borderColor={msg.sender !== 'user' ? 'gray.200' : 'transparent'}
                  />
                  <Box
                    bg={msg.sender === 'user' ? userBg : botBg}
                    p={3.5}
                    borderRadius="2xl"
                    borderTopLeftRadius={msg.sender === 'user' ? '2xl' : '4px'}
                    borderTopRightRadius={msg.sender === 'user' ? '4px' : '2xl'}
                    maxWidth="100%"
                    position="relative"
                    shadow="sm"
                  >
                    <VStack align="start" spacing={1.5}>
                      <Text 
                        whiteSpace="pre-wrap" 
                        wordBreak="break-word"
                        fontSize="xs"
                        lineHeight="1.6"
                        color="gray.800"
                        fontWeight="500"
                      >
                        {msg.text}
                      </Text>
                      {msg.sender === 'bot' && msg.isStreaming && (
                        <Spinner size="xs" color="brand.500" thickness="2px" />
                      )}
                    </VStack>
                    
                    {/* Message footer */}
                    <Flex justify="space-between" align="center" mt={2} gap={4}>
                      <Text fontSize="9px" color="gray.400" fontWeight="bold">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                      {msg.sender === 'bot' && !msg.isError && (
                        <Tooltip label={copied === msg.id ? 'Copied!' : 'Copy response'}>
                          <IconButton
                            size="xs"
                            icon={copied === msg.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            variant="ghost"
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            opacity={0.5}
                            _hover={{ opacity: 1, bg: 'whiteAlpha.600' }}
                            borderRadius="lg"
                            h="5"
                            w="5"
                            minW="auto"
                          />
                        </Tooltip>
                      )}
                    </Flex>
                  </Box>
                </Flex>
              ))}
              
              {isLoading && (
                <Flex gap={2.5} maxWidth="90%">
                  <Avatar
                    size="xs"
                    icon={<Bot size={12} />}
                    bg="transparent"
                    border="1px solid"
                    borderColor="gray.200"
                  />
                  <Box
                    bg={botBg}
                    p={3}
                    borderRadius="2xl"
                    borderTopLeftRadius="4px"
                    shadow="sm"
                  >
                    <Flex gap={1} py={1}>
                      <Box w="1.5" h="1.5" bg="brand.500" borderRadius="full" animation="pulse 1s infinite" />
                      <Box w="1.5" h="1.5" bg="brand.500" borderRadius="full" animation="pulse 1s infinite" style={{ animationDelay: '0.2s' }} />
                      <Box w="1.5" h="1.5" bg="brand.500" borderRadius="full" animation="pulse 1s infinite" style={{ animationDelay: '0.4s' }} />
                    </Flex>
                  </Box>
                </Flex>
              )}
              
              <div ref={messagesEndRef} />
            </VStack>
          </Box>
          
          {/* Quick Questions - Show on first load */}
          {messages.length === 1 && (
            <Box p={3.5} borderTop="1px solid" borderColor={borderColor} bg="rgba(248, 250, 252, 0.8)">
              <Text fontSize="10px" fontWeight="800" mb={2} color="gray.500" textTransform="uppercase" letterSpacing="0.5px">
                ✨ Quick Start
              </Text>
              <VStack spacing={1.5} align="stretch">
                {quickQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    size="xs"
                    variant="ghost"
                    justifyContent="flex-start"
                    fontSize="xs"
                    onClick={() => handleQuickQuestion(q.query)}
                    leftIcon={<q.icon size={13} style={{ color: '#6366f1' }} />}
                    _hover={{ 
                      bg: 'rgba(99, 102, 241, 0.08)',
                      color: 'brand.600'
                    }}
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    borderRadius="xl"
                    transition="all 0.2s"
                    fontWeight="600"
                    py={2.5}
                    h="auto"
                  >
                    {q.text}
                  </Button>
                ))}
              </VStack>
            </Box>
          )}
          
          {/* Input Area */}
          <Box p={3.5} borderTop="1px solid" borderColor={borderColor} bg="white">
            <InputGroup size="sm" mb={2}>
              <Textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (Shift+Enter for new line)"
                borderRadius="xl"
                resize="none"
                rows={2}
                disabled={isLoading}
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                fontSize="xs"
                _focus={{
                  borderColor: 'brand.500',
                  bg: 'white',
                  boxShadow: 'none'
                }}
              />
            </InputGroup>
            
            <HStack justify="space-between" align="center">
              <Tooltip label="Clear conversation">
                <IconButton
                  icon={<MessageCircle size={15} />}
                  size="sm"
                  variant="ghost"
                  onClick={clearChat}
                  aria-label="New chat"
                  borderRadius="xl"
                />
              </Tooltip>
              <Button
                leftIcon={<Send size={14} />}
                bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                color="white"
                size="sm"
                onClick={() => handleSendMessage()}
                isLoading={isLoading}
                loadingText="Thinking..."
                isDisabled={!inputText.trim() || isLoading}
                _hover={{
                  transform: 'translateY(-1px)',
                  shadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                }}
                borderRadius="xl"
                fontWeight="bold"
                px={4}
              >
                Send
              </Button>
            </HStack>
          </Box>
          
          {/* Footer with hints */}
          <Flex 
            p={2} 
            borderTop="1px solid" 
            borderColor={borderColor}
            justifyContent="center"
            fontSize="9px"
            color="gray.400"
            bg="gray.50"
            gap={2.5}
            flexWrap="wrap"
            fontWeight="bold"
          >
            <HStack spacing={1}>
              <Kbd fontSize="9px" px={1} py={0} borderRadius="md">Enter</Kbd>
              <Text>Send</Text>
            </HStack>
            <Text>•</Text>
            <HStack spacing={1}>
              <Kbd fontSize="9px" px={1} py={0} borderRadius="md">Shift+Enter</Kbd>
              <Text>New line</Text>
            </HStack>
          </Flex>
        </Box>
        </Fade>
      )}
      
      {/* Add CSS animation */}
      <style jsx="true">{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
};

export default AIChat;