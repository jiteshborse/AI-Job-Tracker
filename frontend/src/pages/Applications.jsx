import {
    Box,
    Flex,
    Heading,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Select,
    Button,
    VStack,
    HStack,
    Progress,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    SimpleGrid,
    Alert,
    AlertIcon,
    useColorModeValue
} from '@chakra-ui/react';
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Download,
    Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState, useMemo, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const Applications = () => {
    const { applications, updateApplicationStatus, fetchApplications } = useApp();
    const [statusFilter, setStatusFilter] = useState('all');

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
    const tableHoverBg = useColorModeValue('gray.50', 'gray.700');
    const selectBg = useColorModeValue('white', 'gray.700');

    // Filter applications using useMemo
    const filteredApps = useMemo(() => {
        if (statusFilter === 'all') {
            return applications;
        }
        return applications.filter(app => app.status === statusFilter);
    }, [applications, statusFilter]);

    // Calculate stats
    const totalApps = applications.length;
    const interviewCount = applications.filter(app => app.status === 'Interview').length;
    const interviewRate = totalApps > 0
        ? Math.round((interviewCount / totalApps) * 100)
        : 0;

    const offerCount = applications.filter(app => app.status === 'Offer').length;
    const offerRate = totalApps > 0
        ? Math.round((offerCount / totalApps) * 100)
        : 0;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return 'blue';
            case 'Interview': return 'yellow';
            case 'Offer': return 'green';
            case 'Rejected': return 'red';
            default: return 'gray';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Applied': return <FileText size={16} />;
            case 'Interview': return <Clock size={16} />;
            case 'Offer': return <CheckCircle size={16} />;
            case 'Rejected': return <XCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        await updateApplicationStatus(appId, newStatus);
    };

    const exportApplications = () => {
        try {
            const data = JSON.stringify(applications, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'job-applications.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return formatDistanceToNow(date, { addSuffix: true });
        } catch {
            return 'Invalid date';
        }
    };

    if (applications.length === 0) {
        return (
            <Box textAlign="center" py={20}>
                <FileText size={64} style={{ margin: '0 auto 20px', color: '#CBD5E0' }} />
                <Heading size="lg" mb={3}>No Applications Yet</Heading>
                <Text color="gray.600" mb={6}>
                    Start applying to jobs from the Job Feed to track your progress here
                </Text>
                <Button colorScheme="blue">
                    Browse Jobs
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Flex justifyContent="space-between" alignItems="center" mb={8} flexWrap="wrap" gap={4}>
                <Box>
                    <Heading size="lg" mb={2}>Application Tracker</Heading>
                    <Text color="gray.600">
                        Track and manage your job applications in one place
                    </Text>
                </Box>

                <HStack>
                    <Button
                        leftIcon={<Download size={18} />}
                        variant="outline"
                        onClick={exportApplications}
                    >
                        Export Data
                    </Button>
                    <Button
                        leftIcon={<Filter size={18} />}
                        colorScheme="blue"
                        onClick={() => fetchApplications()}
                    >
                        Refresh
                    </Button>
                </HStack>
            </Flex>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
                <Box bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
                    <Stat>
                        <StatLabel>Total Applications</StatLabel>
                        <StatNumber fontSize="3xl">{totalApps}</StatNumber>
                        <StatHelpText>
                            <StatArrow type="increase" />
                            23% from last month
                        </StatHelpText>
                    </Stat>
                </Box>

                <Box bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
                    <Stat>
                        <StatLabel>Interview Rate</StatLabel>
                        <StatNumber fontSize="3xl">{interviewRate}%</StatNumber>
                        <StatHelpText>
                            {interviewCount} interviews
                        </StatHelpText>
                    </Stat>
                </Box>

                <Box bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
                    <Stat>
                        <StatLabel>Offer Rate</StatLabel>
                        <StatNumber fontSize="3xl">{offerRate}%</StatNumber>
                        <StatHelpText>
                            {offerCount} offers
                        </StatHelpText>
                    </Stat>
                </Box>

                <Box bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
                    <Stat>
                        <StatLabel>Active Applications</StatLabel>
                        <StatNumber fontSize="3xl">
                            {applications.filter(app => ['Applied', 'Interview'].includes(app.status)).length}
                        </StatNumber>
                        <StatHelpText>
                            Still in progress
                        </StatHelpText>
                    </Stat>
                </Box>
            </SimpleGrid>

            {/* Status Progress */}
            <Box bg={cardBg} p={6} borderRadius="lg" border="1px" borderColor={borderColor} mb={8}>
                <Heading size="md" mb={4}>Application Pipeline</Heading>
                <Flex alignItems="center" gap={4} flexWrap="wrap">
                    {['Applied', 'Interview', 'Offer', 'Rejected'].map((status) => {
                        const count = applications.filter(app => app.status === status).length;
                        const percentage = totalApps > 0 ? (count / totalApps) * 100 : 0;

                        return (
                            <Box key={status} flex="1" minW="150px">
                                <Flex justifyContent="space-between" mb={1}>
                                    <Text fontSize="sm" fontWeight="medium">{status}</Text>
                                    <Badge colorScheme={getStatusColor(status)}>{count}</Badge>
                                </Flex>
                                <Progress
                                    value={percentage}
                                    colorScheme={getStatusColor(status)}
                                    size="sm"
                                    borderRadius="full"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {percentage.toFixed(1)}%
                                </Text>
                            </Box>
                        );
                    })}
                </Flex>
            </Box>

            {/* Filters */}
            <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={4}>
                <Heading size="md">Your Applications ({filteredApps.length})</Heading>

                <HStack>
                    <Text fontSize="sm">Filter by status:</Text>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="sm"
                        width="150px"
                    >
                        <option value="all">All Status</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                    </Select>
                </HStack>
            </Flex>

            {/* Applications Table */}
            <Box
                bg={cardBg}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                overflow="hidden"
                overflowX="auto"
            >
                <Table variant="simple">
                    <Thead bg={tableHeaderBg}>
                        <Tr>
                            <Th>Job Title</Th>
                            <Th>Company</Th>
                            <Th>Date Applied</Th>
                            <Th>Status</Th>
                            <Th>Last Updated</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredApps.map((app) => (
                            <Tr key={app.id} _hover={{ bg: tableHoverBg }}>
                                <Td fontWeight="medium">{app.jobTitle || 'N/A'}</Td>
                                <Td>{app.company || 'N/A'}</Td>
                                <Td>
                                    <Flex alignItems="center" gap={2}>
                                        <Calendar size={14} />
                                        {formatDate(app.appliedDate || app.createdAt)}
                                    </Flex>
                                </Td>
                                <Td>
                                    <Badge
                                        colorScheme={getStatusColor(app.status)}
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        width="fit-content"
                                        px={2}
                                        py={1}
                                    >
                                        {getStatusIcon(app.status)}
                                        {app.status || 'N/A'}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Text fontSize="sm">
                                        {formatTimeAgo(app.updatedAt || app.createdAt)}
                                    </Text>
                                </Td>
                                <Td>
                                    <Select
                                        value={app.status || 'Applied'}
                                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                        size="sm"
                                        width="140px"
                                        bg={selectBg}
                                    >
                                        <option value="Applied">Applied</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Offer">Offer</option>
                                        <option value="Rejected">Rejected</option>
                                    </Select>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {/* Timeline View */}
            <Box mt={10}>
                <Heading size="md" mb={6}>Recent Activity</Heading>
                <VStack spacing={4} align="stretch">
                    {applications.slice(0, 5).map((app) => (
                        <Flex
                            key={app.id}
                            bg={cardBg}
                            p={4}
                            borderRadius="lg"
                            border="1px"
                            borderColor={borderColor}
                            alignItems="center"
                            gap={4}
                        >
                            <Box
                                w="12px"
                                h="12px"
                                borderRadius="full"
                                bg={`${getStatusColor(app.status)}.500`}
                            />
                            <Box flex="1">
                                <Text fontWeight="medium">{app.jobTitle || 'Unknown Job'} at {app.company || 'Unknown Company'}</Text>
                                <Text fontSize="sm" color="gray.600">
                                    Status: <Badge colorScheme={getStatusColor(app.status)}>{app.status || 'N/A'}</Badge>
                                </Text>
                            </Box>
                            <Text fontSize="sm">
                                {formatTimeAgo(app.updatedAt || app.createdAt)}
                            </Text>
                        </Flex>
                    ))}
                </VStack>
            </Box>

            {/* Tips */}
            <Alert status="info" borderRadius="lg" mt={8}>
                <AlertIcon />
                <Box>
                    <Text fontWeight="medium">Pro Tip</Text>
                    <Text fontSize="sm">
                        Update your application status regularly to track your job search progress accurately.
                        Follow up within 7-10 days if you haven't heard back.
                    </Text>
                </Box>
            </Alert>
        </Box>
    );
};

export default Applications;