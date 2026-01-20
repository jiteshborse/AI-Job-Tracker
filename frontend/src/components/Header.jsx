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
    useColorModeValue,
    Box,
    useBreakpointValue,
    HStack
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
    const { userResume, applications, setShowResumeUpload, logout } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const showFullNav = useBreakpointValue({ base: false, sm: true });

    return (
        <>
            {/* Main Header */}
            <Box
                position="sticky"
                top="0"
                zIndex="1000"
                bg={bgColor}
                borderBottom="2px"
                borderColor={borderColor}
                boxShadow="md"
                transition="all 0.3s ease"
            >
                <Flex
                    h={{ base: '14', md: '16' }}
                    alignItems="center"
                    justifyContent="space-between"
                    px={{ base: 3, md: 6 }}
                    maxW="100vw"
                    overflowX="auto"
                >
                    {/* Logo Section */}
                    <Flex alignItems="center" gap={{ base: 2, md: 4 }}>
                        <IconButton
                            display={{ base: 'flex', md: 'none' }}
                            icon={<MenuIcon size={20} />}
                            variant="ghost"
                            aria-label="Menu"
                            borderRadius="lg"
                            _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                        />
                        <Flex alignItems="center" gap={2}>
                            <Briefcase size={24} color="#667eea" />
                            <Heading
                                size={{ base: 'sm', md: 'lg' }}
                                bgGradient="linear(to-r, #667eea, #764ba2)"
                                bgClip="text"
                                fontWeight="bold"
                                whiteSpace="nowrap"
                            >
                                AI Job Tracker
                            </Heading>
                        </Flex>
                    </Flex>

                    {/* Center Navigation & Actions */}
                    <Flex
                        alignItems="center"
                        gap={{ base: 2, md: 4 }}
                        flexWrap="nowrap"
                        justifyContent="flex-end"
                        flex={{ base: 1, md: 'auto' }}
                        ml={{ base: 2, md: 0 }}
                    >
                        {/* Navigation - Hidden on mobile */}
                        {showFullNav && (
                            <HStack spacing={2} display={{ base: 'none', sm: 'flex' }}>
                                <Button
                                    variant={location.pathname === '/' ? 'solid' : 'ghost'}
                                    colorScheme={location.pathname === '/' ? 'blue' : 'gray'}
                                    onClick={() => navigate('/')}
                                    leftIcon={<Briefcase size={16} />}
                                    size="sm"
                                    borderRadius="lg"
                                    fontWeight="medium"
                                    transition="all 0.2s ease"
                                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                                >
                                    Job Feed
                                </Button>
                                <Button
                                    variant={location.pathname === '/applications' ? 'solid' : 'ghost'}
                                    colorScheme={location.pathname === '/applications' ? 'blue' : 'gray'}
                                    onClick={() => navigate('/applications')}
                                    leftIcon={<Bell size={16} />}
                                    position="relative"
                                    size="sm"
                                    borderRadius="lg"
                                    fontWeight="medium"
                                    transition="all 0.2s ease"
                                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                                >
                                    Applications
                                    {applications.length > 0 && (
                                        <Badge
                                            colorScheme="red"
                                            borderRadius="full"
                                            position="absolute"
                                            top="-2"
                                            right="-2"
                                            fontSize="2xs"
                                            minW="5"
                                            h="5"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            {applications.length}
                                        </Badge>
                                    )}
                                </Button>
                            </HStack>
                        )}

                        {/* Resume Button */}
                        <Button
                            variant={userResume ? 'outline' : 'solid'}
                            colorScheme={userResume ? 'green' : 'orange'}
                            leftIcon={<Upload size={16} />}
                            onClick={() => setShowResumeUpload(true)}
                            size="sm"
                            borderRadius="lg"
                            fontWeight="bold"
                            transition="all 0.2s ease"
                            _hover={{
                                transform: 'translateY(-2px)',
                                shadow: 'lg',
                                bg: userResume ? undefined : 'orange.600'
                            }}
                            bg={userResume ? undefined : 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)'}
                            whiteSpace="nowrap"
                        >
                            <Text display={{ base: 'none', sm: 'inline' }}>
                                {userResume ? 'Resume ✓' : 'Upload Resume'}
                            </Text>
                            <Text display={{ base: 'inline', sm: 'none' }}>
                                {userResume ? '✓' : 'Upload'}
                            </Text>
                        </Button>

                        {/* User Menu */}
                        <Menu>
                            <MenuButton
                                as={IconButton}
                                icon={<User size={20} />}
                                variant="ghost"
                                borderRadius="lg"
                                size="sm"
                                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                                transition="all 0.2s ease"
                            />
                            <MenuList borderRadius="lg" shadow="xl" minW="200px">
                                <MenuItem
                                    icon={<User size={16} />}
                                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                                >
                                    <Text fontWeight="bold">Demo User</Text>
                                </MenuItem>
                                <MenuItem
                                    icon={<Upload size={16} />}
                                    onClick={() => setShowResumeUpload(true)}
                                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                                >
                                    {userResume ? 'Update Resume' : 'Upload Resume'}
                                </MenuItem>
                                <MenuItem
                                    icon={<LogOut size={16} />}
                                    color="red.500"
                                    _hover={{ bg: 'red.50' }}
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
                                >
                                    Logout
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>
                </Flex>
            </Box>

            {/* Mobile Navigation (only for small screens) */}
            {!showFullNav && location.pathname === '/' && (
                <Box
                    display={{ base: 'flex', sm: 'none' }}
                    justifyContent="space-around"
                    py={2}
                    px={4}
                    borderBottom="1px"
                    borderColor={borderColor}
                    bg={bgColor}
                >
                    <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => navigate('/')}
                        colorScheme={location.pathname === '/' ? 'blue' : 'gray'}
                    >
                        <Briefcase size={14} />
                        <Text ml={1} fontSize="xs">Jobs</Text>
                    </Button>
                    <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => navigate('/applications')}
                        colorScheme={location.pathname === '/applications' ? 'blue' : 'gray'}
                    >
                        <Bell size={14} />
                        <Text ml={1} fontSize="xs">Apps</Text>
                        {applications.length > 0 && (
                            <Badge colorScheme="red" ml={1} fontSize="2xs">
                                {applications.length}
                            </Badge>
                        )}
                    </Button>
                </Box>
            )}

            {/* Mobile Stats Bar (simplified) */}
            {/* {applications.length > 0 && location.pathname === '/' && !showStatsBar && (
                <Box
                    display={{ base: 'flex', lg: 'none' }}
                    justifyContent="space-around"
                    alignItems="center"
                    py={1}
                    px={2}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    borderBottom="1px"
                    borderColor={borderColor}
                >
                    <Flex alignItems="center" gap={1}>
                        <Badge colorScheme="blue" fontSize="2xs">
                            A: {applicationStats.Applied || 0}
                        </Badge>
                        <Badge colorScheme="yellow" fontSize="2xs" ml={1}>
                            I: {applicationStats.Interview || 0}
                        </Badge>
                        <Badge colorScheme="green" fontSize="2xs" ml={1}>
                            O: {applicationStats.Offer || 0}
                        </Badge>
                        <Badge colorScheme="red" fontSize="2xs" ml={1}>
                            R: {applicationStats.Rejected || 0}
                        </Badge>
                    </Flex>
                </Box>
            )} */}
        </>
    );
};

export default Header;