import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Flex,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Badge,
    Skeleton,
    SkeletonText,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    IconButton
} from '@chakra-ui/react';
import {
    Sparkles,
    RefreshCw,
    LayoutGrid,
    LayoutList,
    ChevronRight,
    Zap,
    Award,
    Clock,
    Briefcase,
    TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import JobCard from '../components/JobCard';
import toast from 'react-hot-toast';

const JobFeed = () => {
    const { jobs, bestMatches, loading, fetchJobs, loadMoreJobs, userResume, setFilters, applications, totalJobs } = useApp();
    const [viewMode, setViewMode] = useState('grid');

    const cardBg = 'white';
    const borderColor = 'rgba(226, 232, 240, 0.8)';

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading) {
                fetchJobs();
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [loading, fetchJobs]);

    const handleRefresh = () => {
        fetchJobs();
        toast.success('Jobs refreshed!');
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

        setFilters(reset);
        fetchJobs(reset);
        setViewMode('grid');
    };

    // Calculate stats safely
    const highMatchJobs = jobs.filter(j => j?.matchScore >= 70).length;
    const remoteJobs = jobs.filter(j => j?.workMode === 'Remote').length;

    // Calculate new jobs from last 7 days
    const newJobs = jobs.filter(j => {
        if (!j?.postedDate) return false;
        try {
            const jobDate = new Date(j.postedDate);
            if (isNaN(jobDate.getTime())) return false;

            const now = new Date();
            const daysAgo = (now.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
            return daysAgo <= 7;
        } catch {
            return false;
        }
    }).length;

    const applicationStats = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <Box className="fade-in">
            {/* Header section with Stats summary */}
            <Flex
                justifyContent="space-between"
                alignItems="center"
                mb={8}
                flexWrap="wrap"
                gap={4}
            >
                <Box>
                    <Flex alignItems="center" gap={3} flexWrap="wrap" mb={2}>
                        <Heading 
                            size="lg" 
                            fontWeight="800" 
                            letterSpacing="-0.5px" 
                            fontFamily="'Plus Jakarta Sans', sans-serif"
                            color="gray.800"
                        >
                            AI Job Opportunities
                        </Heading>
                        {applications.length > 0 && (
                            <HStack spacing={1.5} flexWrap="wrap">
                                <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={0.5} fontSize="10px" fontWeight="bold">
                                    Applied {applicationStats.Applied || 0}
                                </Badge>
                                <Badge colorScheme="yellow" variant="subtle" borderRadius="full" px={3} py={0.5} fontSize="10px" fontWeight="bold">
                                    Interview {applicationStats.Interview || 0}
                                </Badge>
                                <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} py={0.5} fontSize="10px" fontWeight="bold">
                                    Offer {applicationStats.Offer || 0}
                                </Badge>
                            </HStack>
                        )}
                    </Flex>
                    <Text color="gray.500" fontSize="sm" fontWeight="500">
                        {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} match your preferences
                    </Text>
                </Box>

                <HStack spacing={2.5}>
                    <IconButton
                        icon={<RefreshCw size={16} />}
                        onClick={handleRefresh}
                        isLoading={loading}
                        aria-label="Refresh jobs"
                        variant="outline"
                        borderColor="gray.200"
                        _hover={{ bg: 'gray.50' }}
                        borderRadius="xl"
                        isDisabled={loading}
                        size="sm"
                    />
                    <Button
                        leftIcon={<LayoutGrid size={15} />}
                        variant={viewMode === 'grid' ? 'solid' : 'outline'}
                        onClick={() => setViewMode('grid')}
                        size="sm"
                        borderRadius="xl"
                        fontWeight="bold"
                        fontSize="xs"
                        colorScheme={viewMode === 'grid' ? 'brand' : 'gray'}
                        bg={viewMode === 'grid' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent'}
                        _hover={viewMode === 'grid' ? { bg: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' } : { bg: 'gray.50' }}
                    >
                        Grid
                    </Button>
                    <Button
                        leftIcon={<LayoutList size={15} />}
                        variant={viewMode === 'list' ? 'solid' : 'outline'}
                        onClick={() => setViewMode('list')}
                        size="sm"
                        borderRadius="xl"
                        fontWeight="bold"
                        fontSize="xs"
                        colorScheme={viewMode === 'list' ? 'brand' : 'gray'}
                        bg={viewMode === 'list' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent'}
                        _hover={viewMode === 'list' ? { bg: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' } : { bg: 'gray.50' }}
                    >
                        List
                    </Button>
                </HStack>
            </Flex>

            {/* Resume Upload CTA warning alert */}
            {!userResume && (
                <Alert 
                    status="warning" 
                    borderRadius="2xl" 
                    mb={6} 
                    border="1px solid" 
                    borderColor="orange.200"
                    bg="orange.50"
                    shadow="sm"
                >
                    <AlertIcon color="orange.500" />
                    <Box>
                        <AlertTitle fontSize="sm" fontWeight="bold" color="orange.800">Upload your resume to activate Gemini AI matching!</AlertTitle>
                        <AlertDescription fontSize="xs" color="orange.700" fontWeight="500">
                            GEMINI match scoring will analyze your skills and past experiences to find highly aligned positions.
                        </AlertDescription>
                    </Box>
                </Alert>
            )}

            {/* Stats Cards Widget Row */}
            <Grid
                templateColumns={{
                    base: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)'
                }}
                gap={5}
                mb={8}
            >
                <Box
                    bg={cardBg}
                    p={5}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="0 4px 20px rgba(0, 0, 0, 0.01)"
                    _hover={{ shadow: '0 8px 25px rgba(99, 102, 241, 0.06)', transform: 'translateY(-2px)' }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                    <Flex justify="space-between" align="center" mb={2.5}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">High Match</Text>
                        <Box p={1.5} bg="green.50" color="green.500" borderRadius="xl"><Award size={15} /></Box>
                    </Flex>
                    <Heading size="lg" fontWeight="800" color="green.500" fontFamily="'Plus Jakarta Sans', sans-serif" mb={1}>{highMatchJobs}</Heading>
                    <Text fontSize="10px" fontWeight="bold" color="gray.500">Score &ge; 70%</Text>
                </Box>

                <Box
                    bg={cardBg}
                    p={5}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="0 4px 20px rgba(0, 0, 0, 0.01)"
                    _hover={{ shadow: '0 8px 25px rgba(99, 102, 241, 0.06)', transform: 'translateY(-2px)' }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                    <Flex justify="space-between" align="center" mb={2.5}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Remote Positions</Text>
                        <Box p={1.5} bg="blue.50" color="blue.500" borderRadius="xl"><Clock size={15} /></Box>
                    </Flex>
                    <Heading size="lg" fontWeight="800" color="blue.500" fontFamily="'Plus Jakarta Sans', sans-serif" mb={1}>{remoteJobs}</Heading>
                    <Text fontSize="10px" fontWeight="bold" color="gray.500">Work from anywhere</Text>
                </Box>

                <Box
                    bg={cardBg}
                    p={5}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="0 4px 20px rgba(0, 0, 0, 0.01)"
                    _hover={{ shadow: '0 8px 25px rgba(99, 102, 241, 0.06)', transform: 'translateY(-2px)' }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                    <Flex justify="space-between" align="center" mb={2.5}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">New This Week</Text>
                        <Box p={1.5} bg="purple.50" color="purple.500" borderRadius="xl"><Briefcase size={15} /></Box>
                    </Flex>
                    <Heading size="lg" fontWeight="800" color="purple.500" fontFamily="'Plus Jakarta Sans', sans-serif" mb={1}>{newJobs}</Heading>
                    <Text fontSize="10px" fontWeight="bold" color="gray.500">Recently posted</Text>
                </Box>

                <Box
                    bg={cardBg}
                    p={5}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="0 4px 20px rgba(0, 0, 0, 0.01)"
                    _hover={{ shadow: '0 8px 25px rgba(99, 102, 241, 0.06)', transform: 'translateY(-2px)' }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                    <Flex justify="space-between" align="center" mb={2.5}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Total Jobs</Text>
                        <Box p={1.5} bg="orange.50" color="orange.500" borderRadius="xl"><TrendingUp size={15} /></Box>
                    </Flex>
                    <Heading size="lg" fontWeight="800" color="orange.500" fontFamily="'Plus Jakarta Sans', sans-serif" mb={1}>{jobs.length}</Heading>
                    <Text fontSize="10px" fontWeight="bold" color="gray.500">Available now</Text>
                </Box>
            </Grid>

            {/* Best Matches Section */}
            {bestMatches && bestMatches.length > 0 && (
                <Box mb={10}>
                    <Flex alignItems="center" gap={2.5} mb={5}>
                        <Sparkles size={20} color="#EBB305" />
                        <Heading 
                            size="md" 
                            fontWeight="800" 
                            fontFamily="'Plus Jakarta Sans', sans-serif"
                            color="gray.800"
                        >
                            Best Matches for You
                        </Heading>
                        <Badge bg="yellow.100" color="yellow.800" fontSize="xs" borderRadius="full" px={3} py={0.5} fontWeight="bold">
                            Top {Math.min(bestMatches.length, 8)} Picks
                        </Badge>
                    </Flex>

                    <Grid
                        templateColumns={{
                            base: '1fr',
                            md: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
                            lg: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr'
                        }}
                        gap={6}
                        mb={6}
                    >
                        {bestMatches.slice(0, 8).map((job, index) => (
                            <Box
                                key={job?.id || `best-match-${index}`}
                                position="relative"
                                border="2px solid"
                                borderColor="yellow.400"
                                borderRadius="2xl"
                                overflow="hidden"
                                sx={{
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #F59E0B, #EAB308)',
                                        zIndex: 10
                                    }
                                }}
                            >
                                <JobCard job={job} />
                            </Box>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* All Opportunities Header */}
            <Flex justifyContent="space-between" alignItems="center" mb={5}>
                <Heading 
                    size="md" 
                    fontWeight="800" 
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    color="gray.850"
                >
                    All Job Opportunities
                </Heading>
                <Text color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.5px">
                    Sorted by Match Score
                </Text>
            </Flex>

            {/* Loading Skeletal State */}
            {loading && (
                <Grid
                    templateColumns={{
                        base: '1fr',
                        md: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
                        lg: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr'
                    }}
                    gap={6}
                >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Box key={i} bg={cardBg} p={6} borderRadius="2xl" border="1px solid" borderColor={borderColor}>
                            <Skeleton height="24px" mb={4} borderRadius="md" />
                            <SkeletonText mt="4" noOfLines={3} spacing="4" />
                            <Skeleton height="36px" mt={6} borderRadius="xl" />
                        </Box>
                    ))}
                </Grid>
            )}

            {/* Jobs List Grid */}
            {!loading && jobs.length > 0 && (
                <Grid
                    templateColumns={{
                        base: '1fr',
                        md: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
                        lg: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr'
                    }}
                    gap={6}
                >
                    {jobs.map((job, index) => (
                        <JobCard key={job?.id || `job-${index}`} job={job} />
                    ))}
                </Grid>
            )}

            {/* Load More Button */}
            {!loading && jobs.length > 0 && typeof totalJobs === 'number' && jobs.length < totalJobs && (
                <Flex justifyContent="center" mt={10} mb={6}>
                    <Button
                        variant="outline"
                        borderColor="brand.300"
                        color="brand.600"
                        _hover={{ bg: 'rgba(99, 102, 241, 0.05)' }}
                        rightIcon={<ChevronRight size={16} />}
                        onClick={loadMoreJobs}
                        isLoading={loading}
                        size="md"
                        borderRadius="xl"
                        fontWeight="bold"
                    >
                        Load More Jobs
                    </Button>
                </Flex>
            )}

            {/* No Jobs Found Page */}
            {!loading && jobs.length === 0 && (
                <Box
                    textAlign="center"
                    py={16}
                    bg={cardBg}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="sm"
                >
                    <Zap size={44} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
                    <Heading size="md" mb={2} fontWeight="800" color="gray.700" fontFamily="'Plus Jakarta Sans', sans-serif">No jobs found</Heading>
                    <Text color="gray.500" fontSize="sm" mb={6} fontWeight="500">
                        Try adjusting your filters or upload your resume for better matches.
                    </Text>
                    <Button
                        bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                        color="white"
                        borderRadius="xl"
                        fontWeight="bold"
                        onClick={handleResetFilters}
                        _hover={{ bg: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }}
                    >
                        Reset Filters
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default JobFeed;