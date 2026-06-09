import React from 'react';
import {
    Flex,
    Heading,
    Button,
    IconButton,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Badge,
    Box,
    useBreakpointValue,
    HStack,
    Avatar
} from '@chakra-ui/react';
import {
    Briefcase,
    Upload,
    User,
    Bell,
    Menu as MenuIcon,
    LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const { user, userResume, applications, setShowResumeUpload, logout } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Modern premium glassmorphism styling
    const bgColor = 'rgba(255, 255, 255, 0.75)';
    const borderColor = 'rgba(226, 232, 240, 0.8)';

    const showFullNav = useBreakpointValue({ base: false, sm: true });

    return (
        <>
            {/* Main Header */}
            <Box
                position="sticky"
                top="0"
                zIndex="1000"
                bg={bgColor}
                backdropFilter="blur(16px)"
                borderBottom="1px solid"
                borderColor={borderColor}
                boxShadow="0 4px 30px rgba(0, 0, 0, 0.03)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
                <Flex
                    h={{ base: '14', md: '16' }}
                    alignItems="center"
                    justifyContent="space-between"
                    px={{ base: 4, md: 6 }}
                    maxW="100vw"
                >
                    {/* Logo Section */}
                    <Flex alignItems="center" gap={{ base: 2, md: 4 }}>
                        <Flex alignItems="center" gap={2.5} cursor="pointer" onClick={() => navigate('/')}>
                            <Box 
                                p={2} 
                                bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" 
                                borderRadius="xl"
                                color="white"
                                shadow="0 4px 12px rgba(99, 102, 241, 0.25)"
                            >
                                <Briefcase size={20} />
                            </Box>
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                bgGradient="linear(to-r, #6366f1, #4f46e5)"
                                bgClip="text"
                                fontWeight="800"
                                whiteSpace="nowrap"
                                letterSpacing="-0.5px"
                                fontFamily="'Plus Jakarta Sans', sans-serif"
                            >
                                AI Job Tracker
                            </Heading>
                        </Flex>
                    </Flex>

                    {/* Actions and Profile - Only visible if logged in */}
                    {user && (
                        <Flex
                            alignItems="center"
                            gap={{ base: 3, md: 4 }}
                            flexWrap="nowrap"
                            justifyContent="flex-end"
                            flex={{ base: 1, md: 'auto' }}
                        >
                            {/* Navigation - Hidden on mobile */}
                            {showFullNav && (
                                <HStack spacing={2} mr={2}>
                                    <Button
                                        variant={location.pathname === '/' ? 'solid' : 'ghost'}
                                        bg={location.pathname === '/' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent'}
                                        color={location.pathname === '/' ? 'white' : 'gray.600'}
                                        _hover={{
                                            bg: location.pathname === '/' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'rgba(99, 102, 241, 0.08)',
                                            color: location.pathname === '/' ? 'white' : 'brand.600',
                                        }}
                                        onClick={() => navigate('/')}
                                        leftIcon={<Briefcase size={16} />}
                                        size="sm"
                                        borderRadius="xl"
                                        fontWeight="700"
                                        px={4}
                                        py={2}
                                        transition="all 0.2s ease"
                                    >
                                        Job Feed
                                    </Button>
                                    <Button
                                        variant={location.pathname === '/applications' ? 'solid' : 'ghost'}
                                        bg={location.pathname === '/applications' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent'}
                                        color={location.pathname === '/applications' ? 'white' : 'gray.600'}
                                        _hover={{
                                            bg: location.pathname === '/applications' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'rgba(99, 102, 241, 0.08)',
                                            color: location.pathname === '/applications' ? 'white' : 'brand.600',
                                        }}
                                        onClick={() => navigate('/applications')}
                                        leftIcon={<Bell size={16} />}
                                        position="relative"
                                        size="sm"
                                        borderRadius="xl"
                                        fontWeight="700"
                                        px={4}
                                        py={2}
                                        transition="all 0.2s ease"
                                    >
                                        Applications
                                        {applications.length > 0 && (
                                            <Badge
                                                bg="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                                color="white"
                                                borderRadius="full"
                                                position="absolute"
                                                top="-1.5"
                                                right="-1.5"
                                                fontSize="10px"
                                                minW="4.5"
                                                h="4.5"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                border="2px solid white"
                                            >
                                                {applications.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </HStack>
                            )}

                            {/* Resume Button */}
                            <Button
                                variant="solid"
                                bg={userResume ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'}
                                color="white"
                                _hover={{
                                    bg: userResume ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: userResume ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(99, 102, 241, 0.2)'
                                }}
                                leftIcon={<Upload size={16} />}
                                onClick={() => setShowResumeUpload(true)}
                                size="sm"
                                borderRadius="xl"
                                fontWeight="bold"
                                transition="all 0.2s ease"
                                shadow="sm"
                            >
                                <Text display={{ base: 'none', sm: 'inline' }}>
                                    {userResume ? 'Resume Parsed' : 'Upload Resume'}
                                </Text>
                                <Text display={{ base: 'inline', sm: 'none' }}>
                                    {userResume ? '✓' : 'Upload'}
                                </Text>
                            </Button>

                            {/* User Menu */}
                            <Menu>
                                <MenuButton
                                    as={Button}
                                    variant="ghost"
                                    borderRadius="full"
                                    size="sm"
                                    p={1}
                                    _hover={{ bg: 'rgba(99, 102, 241, 0.05)' }}
                                >
                                    <Flex align="center" gap={2} pr={1}>
                                        <Avatar 
                                            size="sm" 
                                            name={user.name} 
                                            bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" 
                                            color="white" 
                                            fontWeight="bold" 
                                        />
                                        <Text display={{ base: 'none', md: 'inline' }} maxW="120px" fontSize="sm" fontWeight="700" color="gray.700" isTruncated>
                                            {user.name}
                                        </Text>
                                    </Flex>
                                </MenuButton>
                                <MenuList 
                                    borderRadius="xl" 
                                    shadow="xl" 
                                    border="1px solid" 
                                    borderColor="gray.100" 
                                    minW="220px" 
                                    py={1}
                                    className="scale-in"
                                >
                                    <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.50">
                                        <Text fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase" letterSpacing="0.5px">Signed in as</Text>
                                        <Text fontSize="sm" fontWeight="bold" color="gray.800" isTruncated>{user.email}</Text>
                                    </Box>
                                    <MenuItem
                                        icon={<Upload size={14} />}
                                        onClick={() => setShowResumeUpload(true)}
                                        fontSize="sm"
                                        py={2.5}
                                        fontWeight="500"
                                        color="gray.700"
                                    >
                                        {userResume ? 'Update Resume' : 'Upload Resume'}
                                    </MenuItem>
                                    <MenuItem
                                        icon={<LogOut size={14} />}
                                        color="red.500"
                                        _hover={{ bg: 'red.50' }}
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                        }}
                                        fontSize="sm"
                                        py={2.5}
                                        fontWeight="500"
                                    >
                                        Logout
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </Flex>
                    )}
                </Flex>
            </Box>

            {/* Mobile Navigation (only for small screens and when logged in) */}
            {user && !showFullNav && (
                <Box
                    display={{ base: 'flex', sm: 'none' }}
                    justifyContent="space-around"
                    py={2.5}
                    px={4}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    bg="rgba(255, 255, 255, 0.9)"
                    backdropFilter="blur(10px)"
                    shadow="sm"
                >
                    <Button
                        variant={location.pathname === '/' ? 'solid' : 'ghost'}
                        size="sm"
                        borderRadius="xl"
                        bg={location.pathname === '/' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent'}
                        color={location.pathname === '/' ? 'white' : 'gray.600'}
                        onClick={() => navigate('/')}
                        leftIcon={<Briefcase size={14} />}
                        px={4}
                    >
                        <Text fontSize="xs" fontWeight="bold">Jobs</Text>
                    </Button>
                    <Button
                        variant={location.pathname === '/applications' ? 'solid' : 'ghost'}
                        size="sm"
                        borderRadius="xl"
                        bg={location.pathname === '/applications' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent'}
                        color={location.pathname === '/applications' ? 'white' : 'gray.600'}
                        onClick={() => navigate('/applications')}
                        leftIcon={<Bell size={14} />}
                        px={4}
                        position="relative"
                    >
                        <Text fontSize="xs" fontWeight="bold">Apps</Text>
                        {applications.length > 0 && (
                            <Badge 
                                bg="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" 
                                color="white"
                                ml={1} 
                                fontSize="9px" 
                                borderRadius="full"
                                border="1px solid white"
                            >
                                {applications.length}
                            </Badge>
                        )}
                    </Button>
                </Box>
            )}
        </>
    );
};

export default Header;