import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    IconButton,
    VStack,
    Icon,
    Flex
} from '@chakra-ui/react';
import { Eye, EyeOff, Lock, Mail, User, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Auth = () => {
    const { login, register, loading } = useApp();
    
    // Tab index
    const [tabIndex, setTabIndex] = useState(0);

    // Form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    
    // UI state
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordToggle = () => setShowPassword(!showPassword);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (error) {
            console.error('Login action failed', error);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
        } catch (error) {
            console.error('Registration action failed', error);
        }
    };

    return (
        <Flex 
            minH="calc(100vh - 120px)" 
            align="center" 
            justify="center"
            py={12}
        >
            <Container maxW="md" px={4}>
                <VStack spacing={6} align="stretch" className="scale-in">
                    {/* Brand Header */}
                    <VStack spacing={2.5} align="center">
                        <Flex 
                            w={14} 
                            h={14} 
                            bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" 
                            color="white" 
                            rounded="2xl" 
                            align="center" 
                            justify="center"
                            boxShadow="0 8px 25px rgba(99, 102, 241, 0.25)"
                        >
                            <Icon as={Briefcase} w={7} h={7} />
                        </Flex>
                        <Heading 
                            size="lg" 
                            fontWeight="800" 
                            color="gray.800" 
                            letterSpacing="-0.5px"
                            fontFamily="'Plus Jakarta Sans', sans-serif"
                        >
                            Welcome to AI Job Tracker
                        </Heading>
                        <Text color="gray.500" fontSize="sm" textAlign="center" fontWeight="500">
                            Find, match, and track your job applications with AI intelligence
                        </Text>
                    </VStack>

                    {/* Auth Card */}
                    <Box
                        bg="white"
                        py={8}
                        px={{ base: 6, md: 8 }}
                        shadow="0 15px 35px rgba(0, 0, 0, 0.05)"
                        rounded="2xl"
                        border="1px solid"
                        borderColor="rgba(226, 232, 240, 0.8)"
                    >
                        <Tabs 
                            isFitted 
                            variant="soft-rounded" 
                            index={tabIndex}
                            onChange={(index) => {
                                setTabIndex(index);
                                // Clear input fields on tab change
                                setEmail('');
                                setPassword('');
                                setName('');
                            }}
                        >
                            <TabList mb={6} bg="gray.50" p={1} rounded="xl">
                                <Tab 
                                    py={2.5} 
                                    fontSize="sm" 
                                    fontWeight="bold" 
                                    rounded="lg"
                                    color="gray.500"
                                    _selected={{ bg: 'white', color: 'brand.600', shadow: 'sm' }}
                                >
                                    Sign In
                                </Tab>
                                <Tab 
                                    py={2.5} 
                                    fontSize="sm" 
                                    fontWeight="bold" 
                                    rounded="lg"
                                    color="gray.500"
                                    _selected={{ bg: 'white', color: 'brand.600', shadow: 'sm' }}
                                >
                                    Register
                                </Tab>
                            </TabList>

                            <TabPanels>
                                {/* Login Panel */}
                                <TabPanel p={0}>
                                    <form onSubmit={handleLoginSubmit}>
                                        <Stack spacing={4.5}>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">Email Address</FormLabel>
                                                <InputGroup size="md">
                                                    <InputLeftElement pointerEvents="none">
                                                        <Icon as={Mail} color="gray.400" w={4} h={4} />
                                                    </InputLeftElement>
                                                    <Input
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        focusBorderColor="brand.500"
                                                        rounded="xl"
                                                        bg="gray.50"
                                                        border="1px solid"
                                                        borderColor="gray.200"
                                                        fontSize="sm"
                                                        _focus={{ bg: 'white' }}
                                                    />
                                                </InputGroup>
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">Password</FormLabel>
                                                <InputGroup size="md">
                                                    <InputLeftElement pointerEvents="none">
                                                        <Icon as={Lock} color="gray.400" w={4} h={4} />
                                                    </InputLeftElement>
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        focusBorderColor="brand.500"
                                                        rounded="xl"
                                                        bg="gray.50"
                                                        border="1px solid"
                                                        borderColor="gray.200"
                                                        fontSize="sm"
                                                        _focus={{ bg: 'white' }}
                                                    />
                                                    <InputRightElement width="3rem">
                                                        <IconButton
                                                            h="1.75rem"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={handlePasswordToggle}
                                                            icon={showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                            color="gray.400"
                                                            _hover={{ bg: 'transparent' }}
                                                        />
                                                    </InputRightElement>
                                                </InputGroup>
                                            </FormControl>

                                            <Button
                                                type="submit"
                                                bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                                                color="white"
                                                size="lg"
                                                fontSize="sm"
                                                w="full"
                                                isLoading={loading}
                                                loadingText="Signing in..."
                                                mt={2}
                                                rounded="xl"
                                                fontWeight="bold"
                                                shadow="0 4px 15px rgba(99, 102, 241, 0.2)"
                                                _hover={{
                                                    bg: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                                    transform: 'translateY(-1px)',
                                                    shadow: '0 6px 20px rgba(99, 102, 241, 0.25)'
                                                }}
                                            >
                                                Sign In
                                            </Button>
                                        </Stack>
                                    </form>
                                </TabPanel>

                                {/* Register Panel */}
                                <TabPanel p={0}>
                                    <form onSubmit={handleRegisterSubmit}>
                                        <Stack spacing={4.5}>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">Full Name</FormLabel>
                                                <InputGroup size="md">
                                                    <InputLeftElement pointerEvents="none">
                                                        <Icon as={User} color="gray.400" w={4} h={4} />
                                                    </InputLeftElement>
                                                    <Input
                                                        type="text"
                                                        placeholder="John Doe"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        focusBorderColor="brand.500"
                                                        rounded="xl"
                                                        bg="gray.50"
                                                        border="1px solid"
                                                        borderColor="gray.200"
                                                        fontSize="sm"
                                                        _focus={{ bg: 'white' }}
                                                    />
                                                </InputGroup>
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">Email Address</FormLabel>
                                                <InputGroup size="md">
                                                    <InputLeftElement pointerEvents="none">
                                                        <Icon as={Mail} color="gray.400" w={4} h={4} />
                                                    </InputLeftElement>
                                                    <Input
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        focusBorderColor="brand.500"
                                                        rounded="xl"
                                                        bg="gray.50"
                                                        border="1px solid"
                                                        borderColor="gray.200"
                                                        fontSize="sm"
                                                        _focus={{ bg: 'white' }}
                                                    />
                                                </InputGroup>
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">Password</FormLabel>
                                                <InputGroup size="md">
                                                    <InputLeftElement pointerEvents="none">
                                                        <Icon as={Lock} color="gray.400" w={4} h={4} />
                                                    </InputLeftElement>
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Min. 6 characters"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        focusBorderColor="brand.500"
                                                        rounded="xl"
                                                        bg="gray.50"
                                                        border="1px solid"
                                                        borderColor="gray.200"
                                                        fontSize="sm"
                                                        _focus={{ bg: 'white' }}
                                                    />
                                                    <InputRightElement width="3rem">
                                                        <IconButton
                                                            h="1.75rem"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={handlePasswordToggle}
                                                            icon={showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                            color="gray.400"
                                                            _hover={{ bg: 'transparent' }}
                                                        />
                                                    </InputRightElement>
                                                </InputGroup>
                                            </FormControl>

                                            <Button
                                                type="submit"
                                                bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                                                color="white"
                                                size="lg"
                                                fontSize="sm"
                                                w="full"
                                                isLoading={loading}
                                                loadingText="Creating account..."
                                                mt={2}
                                                rounded="xl"
                                                fontWeight="bold"
                                                shadow="0 4px 15px rgba(99, 102, 241, 0.2)"
                                                _hover={{
                                                    bg: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                                    transform: 'translateY(-1px)',
                                                    shadow: '0 6px 20px rgba(99, 102, 241, 0.25)'
                                                }}
                                            >
                                                Create Account
                                            </Button>
                                        </Stack>
                                    </form>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Box>
                </VStack>
            </Container>
        </Flex>
    );
};

export default Auth;
