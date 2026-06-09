import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    Heading,
    Input,
    Select,
    Button,
    Text,
    Flex,
    IconButton,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    HStack,
    InputGroup,
    InputLeftElement
} from '@chakra-ui/react';
import { 
    Filter, 
    X, 
    Briefcase, 
    MapPin, 
    Clock, 
    Layers, 
    Calendar, 
    Award, 
    Search,
    Wrench
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
    const { filters, setFilters, fetchJobs } = useApp();
    const [tempFilters, setTempFilters] = useState(filters);
    const [selectedSkills, setSelectedSkills] = useState(filters.skills || []);

    const bgColor = 'white';
    const borderColor = 'rgba(226, 232, 240, 0.8)';
    const sectionBg = 'gray.50';
    const accentGradient = 'linear(to-r, #6366f1, #4f46e5)';

    const skillOptions = [
        'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java',
        'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'GraphQL',
        'Next.js', 'Tailwind CSS', 'Figma', 'UI/UX', 'DevOps', 'CI/CD',
        'Express', 'Django', 'Flask', 'Spring', 'Vue', 'Angular',
        'HTML', 'CSS', 'SASS', 'Redux', 'Jest', 'Testing'
    ];

    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
    const workModes = ['Remote', 'Hybrid', 'On-site'];
    const dateOptions = [
        { value: 'any', label: 'Any time' },
        { value: '24h', label: 'Last 24 hours' },
        { value: 'week', label: 'Last week' },
        { value: 'month', label: 'Last month' }
    ];
    const matchScoreOptions = [
        { value: 'all', label: 'All Scores' },
        { value: 'high', label: 'High (>70%)' },
        { value: 'medium', label: 'Medium (40-70%)' },
        { value: 'low', label: 'Low (<40%)' }
    ];

    // Initialize from context
    useEffect(() => {
        setTempFilters(filters);
        setSelectedSkills(filters.skills || []);
    }, [filters]);

    const handleSkillToggle = (skill) => {
        const newSkills = selectedSkills.includes(skill)
            ? selectedSkills.filter(s => s !== skill)
            : [...selectedSkills, skill];
        setSelectedSkills(newSkills);
        setTempFilters(prev => ({ ...prev, skills: newSkills }));
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        fetchJobs(tempFilters);
        toast.success('Filters applied!');
    };

    const handleResetFilters = () => {
        const reset = {
            role: '',
            skills: [],
            location: '',
            jobType: '',
            workMode: '',
            datePosted: 'any',
            matchScore: 'all'
        };

        setTempFilters(reset);
        setSelectedSkills([]);
        setFilters(reset);
        fetchJobs(reset);
        toast.success('Filters reset successfully!');
    };

    return (
        <>
            {/* Sidebar Container */}
            <Box
                position={{ base: 'static', md: 'fixed' }}
                left={0}
                top={{ base: 'auto', md: '16' }}
                h={{ base: 'auto', md: 'calc(100vh - 4rem)' }}
                w={{ base: 'full', md: '64' }}
                bg={bgColor}
                borderRight={{ base: 'none', md: '1px solid' }}
                borderColor={borderColor}
                overflowY={{ base: 'visible', md: 'auto' }}
                zIndex={900}
                p={{ base: 4, md: 5 }}
                transition="all 0.3s ease"
            >
                {/* Header Filter Panel */}
                <Box
                    p={4}
                    borderRadius="2xl"
                    bgGradient={accentGradient}
                    color="white"
                    mb={5}
                    shadow="0 8px 20px rgba(99, 102, 241, 0.15)"
                >
                    <Flex alignItems="center" justifyContent="space-between">
                        <Flex alignItems="center" gap={2.5}>
                            <Box
                                w={9}
                                h={9}
                                borderRadius="xl"
                                bg="whiteAlpha.200"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                backdropFilter="blur(5px)"
                            >
                                <Filter size={16} />
                            </Box>
                            <Box>
                                <Heading size="xs" fontWeight="800" letterSpacing="-0.2px">Filter Jobs</Heading>
                                <Text fontSize="10px" opacity={0.8}>Refine job matches</Text>
                            </Box>
                        </Flex>
                        {(tempFilters.role || selectedSkills.length > 0 || tempFilters.location || tempFilters.jobType || tempFilters.workMode || tempFilters.datePosted !== 'any' || tempFilters.matchScore !== 'all') && (
                            <IconButton
                                icon={<X size={14} />}
                                size="xs"
                                variant="ghost"
                                onClick={handleResetFilters}
                                aria-label="Reset filters"
                                color="white"
                                _hover={{ bg: 'whiteAlpha.300' }}
                                borderRadius="lg"
                            />
                        )}
                    </Flex>
                </Box>

                {/* Collapsible Accordion Filters */}
                <Accordion defaultIndex={[0, 1]} allowMultiple>
                    {/* Job Title */}
                    <AccordionItem border="none" mb={3}>
                        <h2>
                            <AccordionButton 
                                px={3} 
                                py={2} 
                                borderRadius="xl" 
                                _hover={{ bg: 'gray.50' }}
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Flex align="center" gap={2}>
                                    <Briefcase size={15} className="text-indigo-500" style={{ color: '#6366f1' }} />
                                    <Text fontSize="sm" fontWeight="700" color="gray.700">Job Title</Text>
                                </Flex>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={2} pt={1} px={3}>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Search size={14} color="#a0aec0" />
                                </InputLeftElement>
                                <Input
                                    placeholder="e.g., React Developer"
                                    value={tempFilters.role || ''}
                                    onChange={(e) => setTempFilters({ ...tempFilters, role: e.target.value })}
                                    borderRadius="lg"
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _focus={{ borderColor: 'brand.500', bg: 'white', boxShadow: 'none' }}
                                    fontSize="xs"
                                />
                            </InputGroup>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Skills Toggle Tags */}
                    <AccordionItem border="none" mb={3}>
                        <h2>
                            <AccordionButton 
                                px={3} 
                                py={2} 
                                borderRadius="xl" 
                                _hover={{ bg: 'gray.50' }}
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Flex align="center" gap={2}>
                                    <Wrench size={15} className="text-indigo-500" style={{ color: '#6366f1' }} />
                                    <Text fontSize="sm" fontWeight="700" color="gray.700">Skills</Text>
                                </Flex>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={2} pt={1} px={3}>
                            <Flex flexWrap="wrap" gap={1.5} maxH="180px" overflowY="auto" pr={1} css={{
                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' }
                            }}>
                                {skillOptions.map((skill) => {
                                    const isSelected = selectedSkills.includes(skill);
                                    return (
                                        <Button
                                            key={skill}
                                            size="xs"
                                            variant={isSelected ? 'solid' : 'outline'}
                                            bg={isSelected ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent'}
                                            color={isSelected ? 'white' : 'gray.600'}
                                            borderColor={isSelected ? 'transparent' : 'gray.200'}
                                            _hover={{
                                                bg: isSelected ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'rgba(99, 102, 241, 0.05)',
                                                borderColor: isSelected ? 'transparent' : 'brand.300',
                                            }}
                                            borderRadius="full"
                                            onClick={() => handleSkillToggle(skill)}
                                            fontWeight="600"
                                            fontSize="10px"
                                            px={2.5}
                                            py={1}
                                            h="auto"
                                        >
                                            {skill}
                                        </Button>
                                    );
                                })}
                            </Flex>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Location */}
                    <AccordionItem border="none" mb={3}>
                        <h2>
                            <AccordionButton 
                                px={3} 
                                py={2} 
                                borderRadius="xl" 
                                _hover={{ bg: 'gray.50' }}
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Flex align="center" gap={2}>
                                    <MapPin size={15} className="text-indigo-500" style={{ color: '#6366f1' }} />
                                    <Text fontSize="sm" fontWeight="700" color="gray.700">Location</Text>
                                </Flex>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={2} pt={1} px={3}>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <MapPin size={14} color="#a0aec0" />
                                </InputLeftElement>
                                <Input
                                    placeholder="e.g., San Francisco"
                                    value={tempFilters.location || ''}
                                    onChange={(e) => setTempFilters({ ...tempFilters, location: e.target.value })}
                                    borderRadius="lg"
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _focus={{ borderColor: 'brand.500', bg: 'white', boxShadow: 'none' }}
                                    fontSize="xs"
                                />
                            </InputGroup>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Job Type */}
                    <AccordionItem border="none" mb={3}>
                        <h2>
                            <AccordionButton 
                                px={3} 
                                py={2} 
                                borderRadius="xl" 
                                _hover={{ bg: 'gray.50' }}
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Flex align="center" gap={2}>
                                    <Layers size={15} className="text-indigo-500" style={{ color: '#6366f1' }} />
                                    <Text fontSize="sm" fontWeight="700" color="gray.700">Job Type</Text>
                                </Flex>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={2} pt={1} px={3}>
                            <Select
                                placeholder="Select job type"
                                value={tempFilters.jobType || ''}
                                onChange={(e) => setTempFilters({ ...tempFilters, jobType: e.target.value })}
                                size="sm"
                                borderRadius="lg"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                fontSize="xs"
                                _focus={{ borderColor: 'brand.500', bg: 'white' }}
                            >
                                {jobTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Work Mode */}
                    <AccordionItem border="none" mb={3}>
                        <h2>
                            <AccordionButton 
                                px={3} 
                                py={2} 
                                borderRadius="xl" 
                                _hover={{ bg: 'gray.50' }}
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Flex align="center" gap={2}>
                                    <Clock size={15} className="text-indigo-500" style={{ color: '#6366f1' }} />
                                    <Text fontSize="sm" fontWeight="700" color="gray.700">Work Mode</Text>
                                </Flex>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={2} pt={1} px={3}>
                            <Select
                                placeholder="Select work mode"
                                value={tempFilters.workMode || ''}
                                onChange={(e) => setTempFilters({ ...tempFilters, workMode: e.target.value })}
                                size="sm"
                                borderRadius="lg"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                fontSize="xs"
                                _focus={{ borderColor: 'brand.500', bg: 'white' }}
                            >
                                {workModes.map((mode) => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </Select>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Date Posted */}
                    <AccordionItem border="none" mb={3}>
                        <h2>
                            <AccordionButton 
                                px={3} 
                                py={2} 
                                borderRadius="xl" 
                                _hover={{ bg: 'gray.50' }}
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Flex align="center" gap={2}>
                                    <Calendar size={15} className="text-indigo-500" style={{ color: '#6366f1' }} />
                                    <Text fontSize="sm" fontWeight="700" color="gray.700">Date Posted</Text>
                                </Flex>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={2} pt={1} px={3}>
                            <Select
                                value={tempFilters.datePosted || 'any'}
                                onChange={(e) => setTempFilters({ ...tempFilters, datePosted: e.target.value })}
                                size="sm"
                                borderRadius="lg"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                fontSize="xs"
                                _focus={{ borderColor: 'brand.500', bg: 'white' }}
                            >
                                {dateOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Match Score */}
                    <AccordionItem border="none" mb={4}>
                        <h2>
                            <AccordionButton 
                                px={3} 
                                py={2} 
                                borderRadius="xl" 
                                _hover={{ bg: 'gray.50' }}
                                display="flex"
                                justifyContent="space-between"
                            >
                                <Flex align="center" gap={2}>
                                    <Award size={15} className="text-indigo-500" style={{ color: '#6366f1' }} />
                                    <Text fontSize="sm" fontWeight="700" color="gray.700">Match Score</Text>
                                </Flex>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={2} pt={1} px={3}>
                            <Select
                                value={tempFilters.matchScore || 'all'}
                                onChange={(e) => setTempFilters({ ...tempFilters, matchScore: e.target.value })}
                                size="sm"
                                borderRadius="lg"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                fontSize="xs"
                                _focus={{ borderColor: 'brand.500', bg: 'white' }}
                            >
                                {matchScoreOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>

                {/* Filter Action Buttons */}
                <VStack spacing={2} pt={3} borderTop="1px solid" borderColor={borderColor}>
                    <Button
                        w="full"
                        onClick={handleApplyFilters}
                        size="sm"
                        borderRadius="xl"
                        bgGradient={accentGradient}
                        color="white"
                        fontWeight="bold"
                        _hover={{ 
                            transform: 'translateY(-1px)', 
                            shadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                            bgGradient: 'linear(to-r, #4f46e5, #4338ca)' 
                        }}
                    >
                        Apply Filters
                    </Button>
                    <Button
                        variant="outline"
                        w="full"
                        onClick={handleResetFilters}
                        size="sm"
                        borderRadius="xl"
                        fontSize="xs"
                        fontWeight="semibold"
                        color="gray.600"
                        borderColor="gray.200"
                        _hover={{ bg: 'gray.50' }}
                    >
                        Clear All
                    </Button>
                </VStack>
            </Box>
        </>
    );
};

export default Sidebar;