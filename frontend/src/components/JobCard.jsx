import React from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Badge,
    Button,
    HStack,
    VStack,
    useColorModeValue,
    Icon
} from '@chakra-ui/react';
import {
    Building,
    MapPin,
    Calendar,
    DollarSign,
    ExternalLink,
    CheckCircle,
    Briefcase,
    Clock,
    TrendingUp,
    Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const JobCard = ({ job, showStats = false }) => {
    const { trackApplication, applications, filters } = useApp();

    // Format salary display
    const formatSalary = (salary) => {
        if (!salary) return 'Not specified';
        if (typeof salary === 'string') return salary;
        
        // If salary is an object with min/max
        if (salary.min && salary.max) {
            const min = (salary.min / 1000).toFixed(0) + 'k';
            const max = (salary.max / 1000).toFixed(0) + 'k';
            return `$${min} - $${max}`;
        }
        if (salary.min) return `$${(salary.min / 1000).toFixed(0)}k+`;
        if (salary.max) return `Up to $${(salary.max / 1000).toFixed(0)}k`;
        return 'Not specified';
    };

    // Safety check
    if (!job) {
        return (
            <Box
                bg={useColorModeValue('white', 'gray.800')}
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                p={5}
                opacity={0.7}
            >
                <Text color="gray.500" textAlign="center">Job not available</Text>
            </Box>
        );
    }

    const isApplied = applications.some(app => app.jobId === job.id);
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const getMatchColor = (score) => {
        if (score >= 70) return 'green';
        if (score >= 40) return 'yellow';
        return 'gray';
    };

    const getMatchIcon = (score) => {
        if (score >= 70) return <Award size={12} />;
        if (score >= 40) return <TrendingUp size={12} />;
        return <Briefcase size={12} />;
    };

    return (
        <Box
            bg={cardBg}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            p={{ base: 4, md: 5 }}
            shadow="sm"
            transition="all 0.2s ease"
            _hover={{
                shadow: 'md',
                borderColor: 'blue.300',
                transform: 'translateY(-2px)'
            }}
            position="relative"
            h="100%"
            display="flex"
            flexDirection="column"
            isolation="isolate"
            zIndex="1"
        >
            {/* Match Score Badge - Top Right */}
            <Box position="absolute" top={3} right={3}>
                <Badge
                    colorScheme={getMatchColor(job?.matchScore)}
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                    gap={1}
                >
                    {getMatchIcon(job?.matchScore || 0)}
                    {job?.matchScore || 0}%
                </Badge>
            </Box>

            {/* Job Title & Company */}
            <Box mb={4} pr={12}>
                <Heading
                    size="md"
                    color="blue.700"
                    mb={1}
                    fontWeight="600"
                    lineHeight="1.3"
                >
                    {job?.title || 'No Title'}
                </Heading>

                <Flex alignItems="center" gap={2} mb={2}>
                    <Icon as={Building} w={4} h={4} color="gray.500" />
                    <Text color="gray.700" fontWeight="500" fontSize="sm">
                        {job?.company || 'Unknown Company'}
                    </Text>
                </Flex>

                <Flex alignItems="center" gap={2}>
                    <Icon as={MapPin} w={4} h={4} color="gray.500" />
                    <Text color="gray.600" fontSize="sm">
                        {job?.location || 'Location not specified'}
                    </Text>
                </Flex>
            </Box>

            {/* Stats Badge Bar - Optional */}
            {showStats && (
                <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={4}
                    p={2}
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    borderRadius="md"
                    fontSize="xs"
                >
                    <VStack spacing={0} align="center">
                        <Badge colorScheme="blue" fontSize="2xs">Remote</Badge>
                        <Text color="gray.500" mt={1}>Work Mode</Text>
                    </VStack>
                    <VStack spacing={0} align="center">
                        <Badge colorScheme="green" fontSize="2xs">{job?.type || 'Full-time'}</Badge>
                        <Text color="gray.500" mt={1}>Type</Text>
                    </VStack>
                    <VStack spacing={0} align="center">
                        <Badge colorScheme="purple" fontSize="2xs">High Pay</Badge>
                        <Text color="gray.500" mt={1}>Salary</Text>
                    </VStack>
                </Flex>
            )}

            {/* Job Details Badges */}
            <HStack mb={4} flexWrap="wrap" spacing={2}>
                <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2} py={1}>
                    <Flex alignItems="center" gap={1}>
                        <Briefcase size={10} />
                        {job?.type || 'Not specified'}
                    </Flex>
                </Badge>
                <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={2} py={1}>
                    <Flex alignItems="center" gap={1}>
                        <Clock size={10} />
                        {job?.workMode || 'Not specified'}
                    </Flex>
                </Badge>
                {job?.salary && (
                    <Badge colorScheme="green" variant="subtle" fontSize="xs" px={2} py={1}>
                        <Flex alignItems="center" gap={1}>
                            <DollarSign size={10} />
                            {formatSalary(job.salary)}
                        </Flex>
                    </Badge>
                )}
            </HStack>

            {/* Skills */}
            {job?.skills && job.skills.length > 0 && (
                <Box mb={4}>
                    <Text fontSize="xs" color="gray.500" mb={2} fontWeight="500">REQUIRED SKILLS</Text>
                    <Flex flexWrap="wrap" gap={1.5}>
                        {job.skills.slice(0, 5).map((skill, index) => (
                            <Badge
                                key={skill || index}
                                colorScheme="blue"
                                variant="solid"
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="md"
                                opacity={0.9}
                                _hover={{ opacity: 1 }}
                            >
                                {skill}
                            </Badge>
                        ))}
                        {job.skills.length > 5 && (
                            <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                                +{job.skills.length - 5} more
                            </Badge>
                        )}
                    </Flex>
                </Box>
            )}

            {/* Active Filters Display */}
            {(filters.role || filters.skills?.length > 0 || filters.location || filters.jobType || filters.workMode || filters.matchScore !== 'all') && (
                <Box mb={4} p={2} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" borderLeft="3px" borderLeftColor="blue.500">
                    <Text fontSize="xs" fontWeight="bold" color="blue.700" mb={1.5}>🔍 Active Filters</Text>
                    <Flex flexWrap="wrap" gap={1.5}>
                        {filters.role && (
                            <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2} py={1}>
                                Role: {filters.role}
                            </Badge>
                        )}
                        {filters.location && (
                            <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={2} py={1}>
                                📍 {filters.location}
                            </Badge>
                        )}
                        {filters.jobType && (
                            <Badge colorScheme="cyan" variant="subtle" fontSize="xs" px={2} py={1}>
                                {filters.jobType}
                            </Badge>
                        )}
                        {filters.workMode && (
                            <Badge colorScheme="teal" variant="subtle" fontSize="xs" px={2} py={1}>
                                {filters.workMode}
                            </Badge>
                        )}
                        {filters.datePosted && filters.datePosted !== 'any' && (
                            <Badge colorScheme="orange" variant="subtle" fontSize="xs" px={2} py={1}>
                                📅 {filters.datePosted === '24h' ? 'Last 24h' : filters.datePosted === 'week' ? 'Last week' : filters.datePosted === 'month' ? 'Last month' : filters.datePosted}
                            </Badge>
                        )}
                        {filters.matchScore && filters.matchScore !== 'all' && (
                            <Badge colorScheme="green" variant="subtle" fontSize="xs" px={2} py={1}>
                                {filters.matchScore === 'high' ? '🎯 High (>70%)' : filters.matchScore === 'medium' ? '📊 Medium (40-70%)' : filters.matchScore}
                            </Badge>
                        )}
                        {filters.skills && filters.skills.length > 0 && (
                            <Badge colorScheme="yellow" variant="subtle" fontSize="xs" px={2} py={1}>
                                ⚙️ {filters.skills.length} skill{filters.skills.length !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </Flex>
                </Box>
            )}

            {/* Description Preview */}
            {job?.description && (
                <Box mb={3} flex="1">
                    <Text
                        fontSize="sm"
                        color="gray.600"
                        noOfLines={3}
                        lineHeight="1.5"
                    >
                        {job.description}
                    </Text>
                </Box>
            )}

            {/* Match Explanation */}
            {job?.matchSummary && (
                <Box mb={4} p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>Why this matches</Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={3}>
                        {job.matchSummary}
                    </Text>
                    {job.matchedSkills && job.matchedSkills.length > 0 && (
                        <HStack spacing={2} mt={2} wrap="wrap" flexWrap="wrap">
                            {job.matchedSkills.slice(0, 4).map((skill) => (
                                <Badge key={skill} colorScheme="green" variant="subtle" borderRadius="full" px={2} py={1} fontSize="xs">
                                    {skill}
                                </Badge>
                            ))}
                        </HStack>
                    )}
                </Box>
            )}

            {/* Footer - Date & Actions */}
            <Flex justifyContent="space-between" alignItems="center" mt="auto" pt={3} borderTop="1px" borderColor={borderColor}>
                <Flex alignItems="center" gap={1}>
                    <Icon as={Calendar} w={3} h={3} color="gray.400" />
                    <Text fontSize="xs" color="gray.500">
                        {job?.postedDate ?
                            new Date(job.postedDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            }) :
                            'Date unknown'
                        }
                    </Text>
                </Flex>

                <Button
                    size="sm"
                    colorScheme={isApplied ? "green" : "blue"}
                    variant={isApplied ? "outline" : "solid"}
                    onClick={() => trackApplication(job)}
                    isDisabled={isApplied}
                    leftIcon={isApplied ? <CheckCircle size={14} /> : <ExternalLink size={14} />}
                    fontWeight="500"
                    borderRadius="md"
                    px={4}
                >
                    {isApplied ? 'Applied ✓' : 'Apply Now'}
                </Button>
            </Flex>

            {/* Applied Indicator */}
            {isApplied && (
                <Box
                    position="absolute"
                    top={-1}
                    right={-1}
                    bg="green.500"
                    color="white"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    transform="rotate(12deg)"
                    fontWeight="bold"
                >
                    ✓
                </Box>
            )}
        </Box>
    );
};

export default JobCard;