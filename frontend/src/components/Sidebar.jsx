import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    Heading,
    Input,
    Select,
    Checkbox,
    CheckboxGroup,
    Button,
    Text,
    Tag,
    TagLabel,
    TagCloseButton,
    useColorModeValue,
    Flex,
    IconButton,
    HStack
} from '@chakra-ui/react';
import { Filter, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
    const { filters, setFilters, fetchJobs } = useApp();
    const [tempFilters, setTempFilters] = useState(filters);
    const [selectedSkills, setSelectedSkills] = useState(filters.skills || []);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const sectionBg = useColorModeValue('gray.50', 'gray.900');
    const accentGradient = 'linear(to-r, #5b8def, #7c5dfa)';

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

        // 1. Reset tempFilters (local sidebar state)
        setTempFilters(reset);

        // 2. Reset selectedSkills (local sidebar state)
        setSelectedSkills([]);

        // 3. Reset global filters (context state)
        setFilters(reset);

        // 4. Fetch jobs with reset filters
        fetchJobs(reset);

        // 5. Optional: Show success message
        toast.success('Filters reset successfully!');
    };

    const removeSkill = (skill) => {
        const newSkills = selectedSkills.filter(s => s !== skill);
        setSelectedSkills(newSkills);
        setTempFilters(prev => ({ ...prev, skills: newSkills }));
    };

    const handleInputChange = useCallback((field, value) => {
        setTempFilters(prev => ({ ...prev, [field]: value }));
    }, []);

    return (
        <>
            {/* Sidebar - Always visible */}
            <Box
                position={{ base: 'static', md: 'fixed' }}
                left={0}
                top={{ base: 'auto', md: '16' }}
                h={{ base: 'auto', md: 'calc(100vh - 4rem)' }}
                w={{ base: 'full', md: '64' }}
                bg={bgColor}
                borderRight={{ base: 'none', md: '1px' }}
                borderColor={borderColor}
                overflowY={{ base: 'visible', md: 'auto' }}
                zIndex={900}
                p={{ base: 4, md: 5 }}
            >
                <Box
                    p={4}
                    borderRadius="lg"
                    bgGradient={accentGradient}
                    color="white"
                    mb={6}
                    shadow="md"
                >
                        <Flex alignItems="center" justifyContent="space-between">
                        <Flex alignItems="center" gap={3}>
                            <Box
                                w={10}
                                h={10}
                                borderRadius="md"
                                bg="whiteAlpha.300"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Filter size={18} />
                            </Box>
                            <Box>
                                <Heading size="sm" fontWeight="bold">Filters</Heading>
                                <Text fontSize="xs" opacity={0.85}>Refine your job feed</Text>
                            </Box>
                        </Flex>
                        <IconButton
                            icon={<X size={16} />}
                            size="sm"
                            variant="ghost"
                            onClick={handleResetFilters}
                            aria-label="Reset filters"
                            color="white"
                            _hover={{ bg: 'whiteAlpha.300' }}
                        />
                    </Flex>
                    {selectedSkills.length > 0 && (
                        <Text fontSize="xs" mt={3} opacity={0.9}>
                            {selectedSkills.length} skills selected
                        </Text>
                    )}
                </Box>

                <VStack spacing={6} align="stretch">
                    {/* Role Search */}
                    <Box bg={sectionBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }}>
                        <Text fontWeight="semibold" mb={2} fontSize="sm" color="gray.700">Job Title</Text>
                        <Input
                            placeholder="e.g., React Developer"
                            value={tempFilters.role || ''}
                            onChange={(e) => setTempFilters({ ...tempFilters, role: e.target.value })}
                            size="sm"
                            borderRadius="md"
                        />
                    </Box>

                    {/* Skills */}
                    <Box bg={sectionBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }}>
                        <Text fontWeight="semibold" mb={2} fontSize="sm" color="gray.700">Skills</Text>
                        <CheckboxGroup>
                            <VStack
                                align="start"
                                spacing={2}
                                maxH="200px"
                                overflowY="auto"
                                p={3}
                                borderWidth="1px"
                                borderRadius="md"
                                bg={bgColor}
                                css={{
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f1f1f1',
                                        borderRadius: '10px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: '#888',
                                        borderRadius: '10px',
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                        background: '#555',
                                    },
                                }}
                            >
                                {skillOptions.map((skill) => (
                                    <Checkbox
                                        key={skill}
                                        isChecked={selectedSkills.includes(skill)}
                                        onChange={() => handleSkillToggle(skill)}
                                        size="sm"
                                        value={skill}
                                        colorScheme="blue"
                                        w="full"
                                    >
                                        <Text fontSize="sm">{skill}</Text>
                                    </Checkbox>
                                ))}
                            </VStack>
                        </CheckboxGroup>
                        {selectedSkills.length > 0 && (
                            <Box mt={3}>
                                <Text fontSize="xs" mb={2} fontWeight="semibold" color="gray.600">Selected:</Text>
                                <Flex flexWrap="wrap" gap={2}>
                                    {selectedSkills.map((skill) => (
                                        <Tag
                                            key={skill}
                                            size="sm"
                                            colorScheme="blue"
                                            borderRadius="full"
                                            variant="subtle"
                                        >
                                            <TagLabel fontSize="xs">{skill}</TagLabel>
                                            <TagCloseButton onClick={() => removeSkill(skill)} size="xs" />
                                        </Tag>
                                    ))}
                                </Flex>
                            </Box>
                        )}
                    </Box>

                    {/* Custom Divider Line */}
                    <Box borderBottom="1px" borderColor={borderColor} my={2} />

                    {/* Location */}
                    <Box bg={sectionBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }}>
                        <Text fontWeight="semibold" mb={2} fontSize="sm" color="gray.700">Location</Text>
                        <Input
                            placeholder="e.g., San Francisco"
                            value={tempFilters.location || ''}
                            onChange={(e) => setTempFilters({ ...tempFilters, location: e.target.value })}
                            size="sm"
                            borderRadius="md"
                        />
                    </Box>

                    {/* Job Type */}
                    <Box bg={sectionBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }}>
                        <Text fontWeight="semibold" mb={2} fontSize="sm" color="gray.700">Job Type</Text>
                        <Select
                            placeholder="Select job type"
                            value={tempFilters.jobType || ''}
                            onChange={(e) => setTempFilters({ ...tempFilters, jobType: e.target.value })}
                            size="sm"
                            borderRadius="md"
                        >
                            {jobTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </Select>
                    </Box>

                    {/* Work Mode */}
                    <Box bg={sectionBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }}>
                        <Text fontWeight="semibold" mb={2} fontSize="sm" color="gray.700">Work Mode</Text>
                        <Select
                            placeholder="Select work mode"
                            value={tempFilters.workMode || ''}
                            onChange={(e) => setTempFilters({ ...tempFilters, workMode: e.target.value })}
                            size="sm"
                            borderRadius="md"
                        >
                            {workModes.map((mode) => (
                                <option key={mode} value={mode}>{mode}</option>
                            ))}
                        </Select>
                    </Box>

                    {/* Date Posted */}
                    <Box bg={sectionBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }}>
                        <Text fontWeight="semibold" mb={2} fontSize="sm" color="gray.700">Date Posted</Text>
                        <Select
                            value={tempFilters.datePosted || 'any'}
                            onChange={(e) => setTempFilters({ ...tempFilters, datePosted: e.target.value })}
                            size="sm"
                            borderRadius="md"
                        >
                            {dateOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Box>

                    {/* Match Score */}
                    <Box bg={sectionBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }}>
                        <Text fontWeight="semibold" mb={2} fontSize="sm" color="gray.700">Match Score</Text>
                        <Select
                            value={tempFilters.matchScore || 'all'}
                            onChange={(e) => setTempFilters({ ...tempFilters, matchScore: e.target.value })}
                            size="sm"
                            borderRadius="md"
                        >
                            {matchScoreOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Box>

                    {/* Action Buttons */}
                    <VStack spacing={2} pt={3}>
                        <Button
                            w="full"
                            onClick={handleApplyFilters}
                            size="sm"
                            borderRadius="lg"
                            bgGradient={accentGradient}
                            color="white"
                            _hover={{ transform: 'translateY(-1px)', shadow: 'md', bgGradient: 'linear(to-r, #4c7be0, #6a4fd8)' }}
                        >
                            Apply Filters
                        </Button>
                        <Button
                            variant="outline"
                            w="full"
                            onClick={handleResetFilters}
                            size="sm"
                            borderRadius="lg"
                        >
                            Clear All Filters
                        </Button>
                    </VStack>
                </VStack>
            </Box>
        </>
    );
};

export default Sidebar;