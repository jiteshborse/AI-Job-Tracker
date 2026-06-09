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
    Icon,
    CircularProgress,
    CircularProgressLabel
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
    Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const JobCard = ({ job, showStats = false }) => {
    const { trackApplication, applications, filters } = useApp();

    // Format salary display safely
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

    if (!job) {
        return (
            <Box
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                p={5}
                opacity={0.7}
            >
                <Text color="gray.500" textAlign="center" fontSize="sm">Job not available</Text>
            </Box>
        );
    }

    const isApplied = applications.some(app => app.jobId === job.id);
    const cardBg = 'white';
    const borderColor = 'rgba(226, 232, 240, 0.8)';

    const getMatchProgressColor = (score) => {
        if (score >= 70) return 'green.400';
        if (score >= 40) return 'yellow.400';
        return 'gray.400';
    };

    return (
        <Box
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            p={{ base: 5, md: 6 }}
            shadow="0 4px 20px rgba(0, 0, 0, 0.02)"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
                shadow: '0 12px 30px rgba(99, 102, 241, 0.08)',
                borderColor: 'brand.200',
                transform: 'translateY(-4px)'
            }}
            position="relative"
            h="100%"
            display="flex"
            flexDirection="column"
            isolation="isolate"
            zIndex="1"
            className="slide-up"
        >
            {/* Match Score Circular Gauge - Top Right */}
            <Box position="absolute" top={4} right={4}>
                <CircularProgress
                    value={job?.matchScore || 0}
                    color={getMatchProgressColor(job?.matchScore)}
                    size="48px"
                    thickness="10px"
                    trackColor="gray.50"
                >
                    <CircularProgressLabel 
                        fontSize="10px" 
                        fontWeight="800" 
                        color="gray.700"
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                    >
                        {job?.matchScore || 0}%
                    </CircularProgressLabel>
                </CircularProgress>
            </Box>

            {/* Job Title & Company */}
            <Box mb={4} pr={14}>
                <Heading
                    size="sm"
                    color="gray.800"
                    mb={1.5}
                    fontWeight="800"
                    lineHeight="1.4"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    _hover={{ color: 'brand.500' }}
                    transition="color 0.2s"
                >
                    {job?.title || 'No Title'}
                </Heading>

                <Flex alignItems="center" gap={2} mb={1}>
                    <Icon as={Building} w={3.5} h={3.5} color="gray.400" />
                    <Text color="gray.600" fontWeight="600" fontSize="xs">
                        {job?.company || 'Unknown Company'}
                    </Text>
                </Flex>

                <Flex alignItems="center" gap={2}>
                    <Icon as={MapPin} w={3.5} h={3.5} color="gray.400" />
                    <Text color="gray.500" fontSize="xs" fontWeight="500">
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
                    p={2.5}
                    bg="gray.50"
                    borderRadius="xl"
                    fontSize="2xs"
                    border="1px solid"
                    borderColor="gray.100"
                >
                    <VStack spacing={0.5} align="center">
                        <Badge colorScheme="blue" fontSize="2xs" borderRadius="md">Remote</Badge>
                        <Text color="gray.400" fontSize="9px" fontWeight="bold">Work Mode</Text>
                    </VStack>
                    <VStack spacing={0.5} align="center">
                        <Badge colorScheme="green" fontSize="2xs" borderRadius="md">{job?.type || 'Full-time'}</Badge>
                        <Text color="gray.400" fontSize="9px" fontWeight="bold">Type</Text>
                    </VStack>
                    <VStack spacing={0.5} align="center">
                        <Badge colorScheme="purple" fontSize="2xs" borderRadius="md">High Pay</Badge>
                        <Text color="gray.400" fontSize="9px" fontWeight="bold">Salary</Text>
                    </VStack>
                </Flex>
            )}

            {/* Job Details Badges */}
            <HStack mb={4} flexWrap="wrap" spacing={1.5}>
                <Badge colorScheme="blue" variant="subtle" fontSize="2xs" px={2.5} py={1} borderRadius="lg" fontWeight="700">
                    <Flex alignItems="center" gap={1}>
                        <Briefcase size={10} />
                        {job?.type || 'Not specified'}
                    </Flex>
                </Badge>
                <Badge colorScheme="purple" variant="subtle" fontSize="2xs" px={2.5} py={1} borderRadius="lg" fontWeight="700">
                    <Flex alignItems="center" gap={1}>
                        <Clock size={10} />
                        {job?.workMode || 'Not specified'}
                    </Flex>
                </Badge>
                {job?.salary && (
                    <Badge colorScheme="green" variant="subtle" fontSize="2xs" px={2.5} py={1} borderRadius="lg" fontWeight="700">
                        <Flex alignItems="center" gap={1}>
                            <DollarSign size={10} />
                            {formatSalary(job.salary)}
                        </Flex>
                    </Badge>
                )}
            </HStack>

            {/* Required Skills list */}
            {job?.skills && job.skills.length > 0 && (
                <Box mb={4}>
                    <Text fontSize="10px" color="gray.400" mb={2} fontWeight="bold" textTransform="uppercase" letterSpacing="0.5px">Required Skills</Text>
                    <Flex flexWrap="wrap" gap={1.5}>
                        {job.skills.slice(0, 5).map((skill, index) => (
                            <Badge
                                key={skill || index}
                                colorScheme="gray"
                                variant="subtle"
                                fontSize="10px"
                                px={2}
                                py={0.5}
                                borderRadius="md"
                                color="gray.600"
                                border="1px solid"
                                borderColor="gray.200"
                            >
                                {skill}
                            </Badge>
                        ))}
                        {job.skills.length > 5 && (
                            <Badge colorScheme="gray" variant="subtle" fontSize="9px" px={2} py={0.5} borderRadius="md">
                                +{job.skills.length - 5} more
                            </Badge>
                        )}
                    </Flex>
                </Box>
            )}

            {/* Description Preview */}
            {job?.description && (
                <Box mb={4} flex="1">
                    <Text
                        fontSize="xs"
                        color="gray.600"
                        noOfLines={3}
                        lineHeight="1.6"
                        fontWeight="500"
                    >
                        {job.description}
                    </Text>
                </Box>
            )}

            {/* Match Explanation */}
            {job?.matchSummary && (
                <Box mb={5} p={3.5} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
                    <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1} letterSpacing="0.3px">AI Recommendation</Text>
                    <Text fontSize="xs" color="gray.600" noOfLines={3} lineHeight="1.5" fontWeight="500">
                        {job.matchSummary}
                    </Text>
                    {job.matchedSkills && job.matchedSkills.length > 0 && (
                        <HStack spacing={1.5} mt={2.5} wrap="wrap" flexWrap="wrap">
                            {job.matchedSkills.slice(0, 4).map((skill) => (
                                <Badge key={skill} colorScheme="green" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="9px" fontWeight="bold">
                                    {skill}
                                </Badge>
                            ))}
                        </HStack>
                    )}
                </Box>
            )}

            {/* Footer - Date & Actions */}
            <Flex justifyContent="space-between" alignItems="center" mt="auto" pt={4} borderTop="1px solid" borderColor={borderColor}>
                <Flex alignItems="center" gap={1}>
                    <Icon as={Calendar} w={3.5} h={3.5} color="gray.400" />
                    <Text fontSize="10px" color="gray.400" fontWeight="bold">
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
                    bg={isApplied ? "transparent" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"}
                    color={isApplied ? "green.500" : "white"}
                    border={isApplied ? "1px solid" : "none"}
                    borderColor={isApplied ? "green.500" : "transparent"}
                    variant={isApplied ? "outline" : "solid"}
                    onClick={() => trackApplication(job)}
                    isDisabled={isApplied}
                    leftIcon={isApplied ? <CheckCircle size={14} /> : <ExternalLink size={14} />}
                    fontWeight="bold"
                    fontSize="xs"
                    borderRadius="xl"
                    px={4}
                    _hover={{
                        bg: isApplied ? "transparent" : "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                        transform: isApplied ? 'none' : 'translateY(-1px)',
                        shadow: isApplied ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.2)'
                    }}
                >
                    {isApplied ? 'Applied' : 'Apply Now'}
                </Button>
            </Flex>

            {/* Applied Indicator Pill top left */}
            {isApplied && (
                <Box
                    position="absolute"
                    top={-2.5}
                    left={4}
                    bg="green.500"
                    color="white"
                    fontSize="10px"
                    fontWeight="extrabold"
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    shadow="sm"
                    textTransform="uppercase"
                >
                    ✓ Tracked
                </Box>
            )}
        </Box>
    );
};

export default JobCard;