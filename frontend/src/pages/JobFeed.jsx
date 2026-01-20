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
    IconButton,
    useColorModeValue
} from '@chakra-ui/react';
import {
    Filter,
    Sparkles,
    RefreshCw,
    LayoutGrid,
    LayoutList,
    ChevronRight,
    FilterX,
    Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import JobCard from '../components/JobCard';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const JobFeed = () => {
    const { jobs, bestMatches, loading, fetchJobs, userResume, setFilters, applications } = useApp();
    const [viewMode, setViewMode] = useState('grid');

    const cardBg = useColorModeValue('white', 'gray.800');

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
        // Call the reset function from context
        const reset = {
            role: '',
            skills: [],
            location: '',
            jobType: '',
            workMode: '',
            datePosted: 'any',
            matchScore: 'all'
        };

        setFilters(reset); // From useApp context
        fetchJobs(reset);

        // Also reset any local state if needed
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
        <Box>
            {/* Header with Stats */}
            <Flex
                justifyContent="space-between"
                alignItems="center"
                mb={8}
                flexWrap="wrap"
                gap={4}
            >
                <Box>
                    <Flex alignItems="center" gap={3} flexWrap="wrap" mb={1}>
                        <Heading size="lg">
                            AI-Powered Job Feed
                        </Heading>
                        {applications.length > 0 && (
                            <HStack spacing={2} flexWrap="wrap">
                                <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs">
                                    Applied {applicationStats.Applied || 0}
                                </Badge>
                                <Badge colorScheme="yellow" variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs">
                                    Interview {applicationStats.Interview || 0}
                                </Badge>
                                <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs">
                                    Offer {applicationStats.Offer || 0}
                                </Badge>
                                <Badge colorScheme="red" variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs">
                                    Rejected {applicationStats.Rejected || 0}
                                </Badge>
                            </HStack>
                        )}
                    </Flex>
                    <Text color="gray.600">
                        {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} matched with your profile
                    </Text>
                </Box>

                <HStack spacing={3}>
                    <IconButton
                        icon={<RefreshCw size={18} />}
                        onClick={handleRefresh}
                        isLoading={loading}
                        aria-label="Refresh jobs"
                        variant="outline"
                        isDisabled={loading}
                    />
                    <Button
                        leftIcon={<LayoutGrid size={18} />}
                        variant={viewMode === 'grid' ? 'solid' : 'outline'}
                        onClick={() => setViewMode('grid')}
                        size="sm"
                    >
                        Grid
                    </Button>
                    <Button
                        leftIcon={<LayoutList size={18} />}
                        variant={viewMode === 'list' ? 'solid' : 'outline'}
                        onClick={() => setViewMode('list')}
                        size="sm"
                    >
                        List
                    </Button>
                </HStack>
            </Flex>

            {/* Resume Alert */}
            {!userResume && (
                <Alert status="warning" borderRadius="md" mb={6}>
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Upload your resume for better matches!</AlertTitle>
                        <AlertDescription>
                            AI matching scores will be more accurate with your resume.
                        </AlertDescription>
                    </Box>
                </Alert>
            )}

            {/* Best Matches Section */}
            {bestMatches && bestMatches.length > 0 && (
                <Box mb={10}>
                    <Flex alignItems="center" gap={3} mb={4}>
                        <Sparkles size={24} color="#ECC94B" />
                        <Heading size="md">✨ Best Matches for You</Heading>
                        <Badge colorScheme="yellow" fontSize="sm">
                            Top {Math.min(bestMatches.length, 8)} picks
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
                                border="2px"
                                borderColor="yellow.400"
                                borderRadius="lg"
                                overflow="hidden"
                                sx={{
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #ECC94B, #F6AD55)',
                                    }
                                }}
                            >
                                <JobCard job={job} />
                            </Box>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Stats Cards */}
            <Grid
                templateColumns={{
                    base: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)'
                }}
                gap={4}
                mb={8}
            >
                <Box
                    bg={cardBg}
                    p={4}
                    borderRadius="lg"
                    borderLeft="4px"
                    borderColor="green.500"
                >
                    <Text fontSize="sm" color="gray.600">High Match Jobs</Text>
                    <Heading size="lg" color="green.600">{highMatchJobs}</Heading>
                    <Text fontSize="xs">Score ≥ 70%</Text>
                </Box>

                <Box
                    bg={cardBg}
                    p={4}
                    borderRadius="lg"
                    borderLeft="4px"
                    borderColor="blue.500"
                >
                    <Text fontSize="sm" color="gray.600">Remote Jobs</Text>
                    <Heading size="lg" color="blue.600">{remoteJobs}</Heading>
                    <Text fontSize="xs">Work from anywhere</Text>
                </Box>

                <Box
                    bg={cardBg}
                    p={4}
                    borderRadius="lg"
                    borderLeft="4px"
                    borderColor="purple.500"
                >
                    <Text fontSize="sm" color="gray.600">New This Week</Text>
                    <Heading size="lg" color="purple.600">{newJobs}</Heading>
                    <Text fontSize="xs">Recently posted</Text>
                </Box>

                <Box
                    bg={cardBg}
                    p={4}
                    borderRadius="lg"
                    borderLeft="4px"
                    borderColor="orange.500"
                >
                    <Text fontSize="sm" color="gray.600">Total Jobs</Text>
                    <Heading size="lg" color="orange.600">{jobs.length}</Heading>
                    <Text fontSize="xs">Available now</Text>
                </Box>
            </Grid>

            {/* All Jobs Header */}
            <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Heading size="md">All Job Opportunities</Heading>
                <Text color="gray.600" fontSize="sm">
                    Sorted by match score
                </Text>
            </Flex>

            {/* Loading State */}
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
                        <Box key={i} bg={cardBg} p={6} borderRadius="lg">
                            <Skeleton height="24px" mb={4} />
                            <SkeletonText mt="4" noOfLines={3} spacing="4" />
                            <Skeleton height="40px" mt={6} />
                        </Box>
                    ))}
                </Grid>
            )}

            {/* Jobs Grid/List */}
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

            {/* No Jobs State */}
            {!loading && jobs.length === 0 && (
                <Box
                    textAlign="center"
                    py={20}
                    bg={cardBg}
                    borderRadius="lg"
                >
                    <Zap size={48} style={{ margin: '0 auto 20px', color: '#CBD5E0' }} />
                    <Heading size="md" mb={3}>No jobs found</Heading>
                    <Text color="gray.600" mb={6}>
                        Try adjusting your filters or upload your resume for better matches
                    </Text>
                    <Button
                        colorScheme="blue"
                        onClick={() => {
                            // Reset filters and fetch jobs
                            handleResetFilters();
                        }}
                    >
                        Reset Filters
                    </Button>
                </Box>
            )}

            {/* Load More Button */}
            {!loading && jobs.length > 0 && (
                <Flex justifyContent="center" mt={10}>
                    <Button
                        variant="outline"
                        rightIcon={<ChevronRight size={18} />}
                        onClick={() => toast.success('More jobs would load from real API')}
                    >
                        Load More Jobs
                    </Button>
                </Flex>
            )}
        </Box>
    );
};

export default JobFeed;