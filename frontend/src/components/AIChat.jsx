import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Avatar,
  IconButton,
  useColorModeValue,
  Badge,
  CloseButton,
  Fade,
  ScaleFade,
  Textarea,
  useToast,
  Spinner,
  Divider,
  InputGroup,
  InputRightElement,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Code,
  OrderedList,
  ListItem,
  Kbd
} from '@chakra-ui/react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  X,
  Sparkles,
  Search,
  HelpCircle,
  Zap,
  Copy,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  MessageCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiApi } from '../services/api';

const AIChat = () => {
  const { filters, userResume, applications } = useApp();
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
  const { isOpen: showHelp, onOpen: openHelp, onClose: closeHelp } = useDisclosure();
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const chatBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const botBg = useColorModeValue('blue.50', 'blue.900');
  const userBg = useColorModeValue('green.50', 'green.900');
  const codeBlockBg = useColorModeValue('gray.900', 'gray.950');
  
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
        await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay per character
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
  
  const renderMessageContent = (text) => {
    // Parse markdown-like formatting
    const parts = [];
    const lines = text.split('\n');
    
    lines.forEach((line, i) => {
      if (line.startsWith('• ')) {
        parts.push(<Text key={i} pl={4} py={1}>• {line.slice(2)}</Text>);
      } else if (line.startsWith('** ') && line.endsWith('**')) {
        parts.push(<Text key={i} fontWeight="bold" py={1}>{line.slice(3, -2)}</Text>);
      } else if (line === '') {
        parts.push(<Box key={i} h={2} />);
      } else {
        parts.push(<Text key={i} py={0.5}>{line}</Text>);
      }
    });
    
    return parts.length > 0 ? parts : text;
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
              leftIcon={<MessageSquare size={20} />}
              colorScheme="blue"
              size="lg"
              onClick={() => setIsOpen(true)}
              shadow="lg"
              borderRadius="full"
              px={6}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              _hover={{
                transform: 'scale(1.05)',
                shadow: 'xl'
              }}
              _active={{
                transform: 'scale(0.98)'
              }}
            >
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
            width={{ base: 'calc(100vw - 48px)', md: '400px' }}
            height="600px"
            maxHeight="calc(100vh - 120px)"
            bg={chatBg}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            shadow="2xl"
            display="flex"
            flexDirection="column"
            zIndex="2001"
            overflow="hidden"
            isolation="isolate"
          >
          {/* Chat Header */}
          <Flex 
            p={4} 
            borderBottom="1px" 
            borderColor={borderColor}
            alignItems="center"
            justifyContent="space-between"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
          >
            <Flex alignItems="center" gap={3}>
              <Avatar 
                size="sm" 
                icon={<Bot size={20} />}
                bg="white"
                color="#667eea"
              />
              <Box>
                <Heading size="sm">AI Job Assistant</Heading>
                <Text fontSize="xs" opacity={0.8}>
                  Powered by GPT
                </Text>
              </Box>
              <Badge colorScheme="green" fontSize="xs">
                Live
              </Badge>
            </Flex>
            
            <HStack>
              <IconButton
                icon={<Zap size={18} />}
                size="sm"
                variant="ghost"
                color="white"
                onClick={clearChat}
                aria-label="Clear chat"
                _hover={{ bg: 'rgba(255,255,255,0.2)' }}
              />
              <CloseButton 
                size="sm" 
                onClick={() => setIsOpen(false)}
                color="white"
                _hover={{ bg: 'rgba(255,255,255,0.2)' }}
              />
            </HStack>
          </Flex>
          
          {/* Messages Container */}
          <Box flex="1" overflowY="auto" p={4}>
            <VStack spacing={4} align="stretch">
              {messages.map((msg) => (
                <Flex
                  key={msg.id}
                  direction={msg.sender === 'user' ? 'row-reverse' : 'row'}
                  gap={3}
                  maxWidth="85%"
                  alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <Avatar
                    size="sm"
                    icon={msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                    bg={msg.sender === 'user' ? 'green.500' : 'blue.500'}
                    color="white"
                  />
                  <Box
                    bg={msg.sender === 'user' ? userBg : botBg}
                    p={3}
                    borderRadius="lg"
                    borderTopLeftRadius={msg.sender === 'user' ? 'lg' : '0'}
                    borderTopRightRadius={msg.sender === 'user' ? '0' : 'lg'}
                    maxWidth="100%"
                    position="relative"
                  >
                    <VStack align="start" spacing={1}>
                      <Text 
                        whiteSpace="pre-wrap" 
                        wordBreak="break-word"
                        fontSize="sm"
                        lineHeight="1.5"
                      >
                        {msg.text}
                      </Text>
                      {msg.sender === 'bot' && msg.isStreaming && (
                        <Spinner size="xs" color="blue.500" />
                      )}
                    </VStack>
                    
                    {/* Message footer */}
                    <HStack spacing={2} mt={2} justify="space-between">
                      <Text fontSize="xs" color={msg.sender === 'user' ? 'gray.600' : 'gray.500'}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                      {msg.sender === 'bot' && !msg.isError && (
                        <Tooltip label={copied === msg.id ? 'Copied!' : 'Copy response'}>
                          <IconButton
                            size="xs"
                            icon={copied === msg.id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                            variant="ghost"
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            opacity={0.6}
                            _hover={{ opacity: 1 }}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </Box>
                </Flex>
              ))}
              
              {isLoading && (
                <Flex gap={3}>
                  <Avatar
                    size="sm"
                    icon={<Bot size={14} />}
                    bg="blue.500"
                    color="white"
                  />
                  <Box
                    bg={botBg}
                    p={3}
                    borderRadius="lg"
                    borderTopLeftRadius="0"
                  >
                    <Flex gap={1}>
                      <Box w="2" h="2" bg="blue.500" borderRadius="full" animation="pulse 1s infinite" />
                      <Box w="2" h="2" bg="blue.500" borderRadius="full" animation="pulse 1s infinite" style={{ animationDelay: '0.2s' }} />
                      <Box w="2" h="2" bg="blue.500" borderRadius="full" animation="pulse 1s infinite" style={{ animationDelay: '0.4s' }} />
                    </Flex>
                  </Box>
                </Flex>
              )}
              
              <div ref={messagesEndRef} />
            </VStack>
          </Box>
          
          {/* Quick Questions - Show on first load */}
          {messages.length === 1 && (
            <Box p={4} borderTop="1px" borderColor={borderColor} bg={useColorModeValue('gray.50', 'gray.900')}>
              <Text fontSize="xs" fontWeight="bold" mb={3} color="gray.600" textTransform="uppercase">
                ✨ Quick Start
              </Text>
              <VStack spacing={2} align="stretch">
                {quickQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="ghost"
                    justifyContent="flex-start"
                    fontSize="xs"
                    onClick={() => handleQuickQuestion(q.query)}
                    leftIcon={<q.icon size={14} />}
                    _hover={{ 
                      bg: useColorModeValue('blue.100', 'blue.900'),
                      borderColor: 'blue.500'
                    }}
                    border="1px"
                    borderColor="transparent"
                    transition="all 0.2s"
                  >
                    {q.text}
                  </Button>
                ))}
              </VStack>
            </Box>
          )}
          
          {/* Input Area */}
          <Box p={4} borderTop="1px" borderColor={borderColor} bg={chatBg}>
            <InputGroup size="sm" mb={2}>
              <Textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (Shift+Enter for new line)"
                borderRadius="md"
                resize="none"
                rows={2}
                disabled={isLoading}
                _focus={{
                  borderColor: 'blue.400',
                  boxShadow: '0 0 0 1px blue.400'
                }}
              />
            </InputGroup>
            
            <HStack justify="flex-end" gap={2}>
              <Tooltip label="Clear conversation">
                <IconButton
                  icon={<MessageCircle size={16} />}
                  size="sm"
                  variant="ghost"
                  onClick={clearChat}
                  aria-label="New chat"
                />
              </Tooltip>
              <Button
                leftIcon={<Send size={16} />}
                colorScheme="blue"
                size="sm"
                onClick={() => handleSendMessage()}
                isLoading={isLoading}
                loadingText="Thinking..."
                isDisabled={!inputText.trim() || isLoading}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg'
                }}
                _active={{
                  transform: 'translateY(0)'
                }}
              >
                Send
              </Button>
            </HStack>
          </Box>
          
          {/* Footer with hints */}
          <Flex 
            p={2.5} 
            borderTop="1px" 
            borderColor={borderColor}
            justifyContent="center"
            fontSize="xs"
            color="gray.500"
            bg={useColorModeValue('gray.50', 'gray.900')}
            gap={2}
            flexWrap="wrap"
          >
            <HStack spacing={1}>
              <Kbd fontSize="xs">Enter</Kbd>
              <Text>Send</Text>
            </HStack>
            <Text>•</Text>
            <HStack spacing={1}>
              <Kbd fontSize="xs">Shift+Enter</Kbd>
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