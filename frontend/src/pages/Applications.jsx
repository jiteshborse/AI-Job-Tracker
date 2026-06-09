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
    IconButton
} from '@chakra-ui/react';
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Download,
    Filter,
    Trash2,
    Kanban,
    Table as TableIcon,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Applications = () => {
    const { applications, updateApplicationStatus, fetchApplications, deleteApplication } = useApp();
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewType, setViewType] = useState('kanban'); // 'kanban' or 'table'

    const handleDeleteApplication = async (appId) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            await deleteApplication(appId);
            toast.success('Application deleted');
        }
    };

    const cardBg = 'white';
    const borderColor = 'rgba(226, 232, 240, 0.8)';
    const tableHeaderBg = 'gray.50';
    const tableHoverBg = 'gray.50';
    const selectBg = 'white';

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
            case 'Applied': return <FileText size={14} />;
            case 'Interview': return <Clock size={14} />;
            case 'Offer': return <CheckCircle size={14} />;
            case 'Rejected': return <XCircle size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        await updateApplicationStatus(appId, newStatus);
        toast.success(`Status updated to ${newStatus}`);
    };

    const moveStatusLeft = async (app) => {
        const statuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
        const currentIndex = statuses.indexOf(app.status);
        if (currentIndex > 0) {
            const nextStatus = statuses[currentIndex - 1];
            await handleStatusChange(app.id, nextStatus);
        }
    };

    const moveStatusRight = async (app) => {
        const statuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
        const currentIndex = statuses.indexOf(app.status);
        if (currentIndex < statuses.length - 1) {
            const nextStatus = statuses[currentIndex + 1];
            await handleStatusChange(app.id, nextStatus);
        }
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
            toast.success('Data exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed');
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
            <Box textAlign="center" py={20} className="scale-in">
                <FileText size={64} style={{ margin: '0 auto 20px', color: '#cbd5e1' }} />
                <Heading size="lg" mb={3} fontWeight="800" fontFamily="'Plus Jakarta Sans', sans-serif">No Applications Yet</Heading>
                <Text color="gray.500" mb={6} fontWeight="500">
                    Track your job applications in one place. Apply to positions on the Job Feed to see them here!
                </Text>
            </Box>
        );
    }

    return (
        <Box className="fade-in">
            {/* Header block */}
            <Flex justifyContent="space-between" alignItems="center" mb={8} flexWrap="wrap" gap={4}>
                <Box>
                    <Heading 
                        size="lg" 
                        fontWeight="800" 
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                        letterSpacing="-0.5px"
                        color="gray.800"
                        mb={1.5}
                    >
                        Application Tracker
                    </Heading>
                    <Text color="gray.500" fontSize="sm" fontWeight="500">
                        Monitor and progress your active job applications
                    </Text>
                </Box>

                <HStack spacing={2.5}>
                    <Button
                        leftIcon={<Download size={16} />}
                        variant="outline"
                        borderColor="gray.200"
                        _hover={{ bg: 'gray.50' }}
                        borderRadius="xl"
                        fontSize="xs"
                        fontWeight="bold"
                        onClick={exportApplications}
                    >
                        Export JSON
                    </Button>
                    <Button
                        leftIcon={<Filter size={16} />}
                        bg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                        color="white"
                        _hover={{ bg: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }}
                        borderRadius="xl"
                        fontSize="xs"
                        fontWeight="bold"
                        onClick={() => fetchApplications()}
                    >
                        Refresh Data
                    </Button>
                </HStack>
            </Flex>

            {/* Premium Stats Widgets */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={8}>
                <Box bg={cardBg} p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor} shadow="0 4px 20px rgba(0, 0, 0, 0.01)">
                    <Stat>
                        <StatLabel fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Total Applications</StatLabel>
                        <StatNumber fontSize="3xl" fontWeight="800" color="gray.850" fontFamily="'Plus Jakarta Sans', sans-serif" py={1}>{totalApps}</StatNumber>
                        <StatHelpText fontSize="10px" fontWeight="bold" color="gray.500" m={0}>
                            All parsed/tracked entries
                        </StatHelpText>
                    </Stat>
                </Box>

                <Box bg={cardBg} p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor} shadow="0 4px 20px rgba(0, 0, 0, 0.01)">
                    <Stat>
                        <StatLabel fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Interview Rate</StatLabel>
                        <StatNumber fontSize="3xl" fontWeight="800" color="yellow.500" fontFamily="'Plus Jakarta Sans', sans-serif" py={1}>{interviewRate}%</StatNumber>
                        <StatHelpText fontSize="10px" fontWeight="bold" color="gray.500" m={0}>
                            {interviewCount} interview schedules
                        </StatHelpText>
                    </Stat>
                </Box>

                <Box bg={cardBg} p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor} shadow="0 4px 20px rgba(0, 0, 0, 0.01)">
                    <Stat>
                        <StatLabel fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Offer Rate</StatLabel>
                        <StatNumber fontSize="3xl" fontWeight="800" color="green.500" fontFamily="'Plus Jakarta Sans', sans-serif" py={1}>{offerRate}%</StatNumber>
                        <StatHelpText fontSize="10px" fontWeight="bold" color="gray.500" m={0}>
                            {offerCount} received offers
                        </StatHelpText>
                    </Stat>
                </Box>

                <Box bg={cardBg} p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor} shadow="0 4px 20px rgba(0, 0, 0, 0.01)">
                    <Stat>
                        <StatLabel fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Active Pipeline</StatLabel>
                        <StatNumber fontSize="3xl" fontWeight="800" color="blue.500" fontFamily="'Plus Jakarta Sans', sans-serif" py={1}>
                            {applications.filter(app => ['Applied', 'Interview'].includes(app.status)).length}
                        </StatNumber>
                        <StatHelpText fontSize="10px" fontWeight="bold" color="gray.500" m={0}>
                            In progress categories
                        </StatHelpText>
                    </Stat>
                </Box>
            </SimpleGrid>

            {/* Pipeline progress bar indicators */}
            <Box bg={cardBg} p={6} borderRadius="2xl" border="1px solid" borderColor={borderColor} mb={8} shadow="0 4px 20px rgba(0, 0, 0, 0.01)">
                <Heading size="xs" fontWeight="800" color="gray.700" mb={4} textTransform="uppercase" letterSpacing="0.5px">Pipeline Distribution</Heading>
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                    {['Applied', 'Interview', 'Offer', 'Rejected'].map((status) => {
                        const count = applications.filter(app => app.status === status).length;
                        const percentage = totalApps > 0 ? (count / totalApps) * 100 : 0;

                        return (
                            <Box key={status}>
                                <Flex justifyContent="space-between" mb={1} align="center">
                                    <Text fontSize="xs" fontWeight="bold" color="gray.600">{status}</Text>
                                    <Badge colorScheme={getStatusColor(status)} borderRadius="full" px={2}>{count}</Badge>
                                </Flex>
                                <Progress
                                    value={percentage}
                                    colorScheme={getStatusColor(status)}
                                    size="xs"
                                    borderRadius="full"
                                    bg="gray.100"
                                />
                                <Text fontSize="10px" color="gray.400" mt={1} fontWeight="bold">
                                    {percentage.toFixed(1)}%
                                </Text>
                            </Box>
                        );
                    })}
                </SimpleGrid>
            </Box>

            {/* View Filter Mode Selector */}
            <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={4}>
                <Heading size="sm" fontWeight="800" color="gray.700" fontFamily="'Plus Jakarta Sans', sans-serif">
                    Applications ({filteredApps.length})
                </Heading>

                <HStack spacing={4}>
                    {/* View Switch Mode Toggle */}
                    <HStack spacing={1.5} bg="gray.100" p={1} borderRadius="xl">
                        <Button
                            leftIcon={<Kanban size={14} />}
                            size="xs"
                            borderRadius="lg"
                            fontWeight="bold"
                            onClick={() => setViewType('kanban')}
                            variant={viewType === 'kanban' ? 'solid' : 'ghost'}
                            bg={viewType === 'kanban' ? 'white' : 'transparent'}
                            color={viewType === 'kanban' ? 'brand.600' : 'gray.650'}
                            shadow={viewType === 'kanban' ? 'sm' : 'none'}
                            _hover={{ bg: viewType === 'kanban' ? 'white' : 'whiteAlpha.600' }}
                        >
                            Kanban
                        </Button>
                        <Button
                            leftIcon={<TableIcon size={14} />}
                            size="xs"
                            borderRadius="lg"
                            fontWeight="bold"
                            onClick={() => setViewType('table')}
                            variant={viewType === 'table' ? 'solid' : 'ghost'}
                            bg={viewType === 'table' ? 'white' : 'transparent'}
                            color={viewType === 'table' ? 'brand.600' : 'gray.650'}
                            shadow={viewType === 'table' ? 'sm' : 'none'}
                            _hover={{ bg: viewType === 'table' ? 'white' : 'whiteAlpha.600' }}
                        >
                            Table
                        </Button>
                    </HStack>

                    <HStack size="sm">
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" whiteSpace="nowrap">Status:</Text>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="sm"
                            width="140px"
                            borderRadius="lg"
                            bg={selectBg}
                            border="1px solid"
                            borderColor="gray.200"
                            fontSize="xs"
                        >
                            <option value="all">All Status</option>
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                        </Select>
                    </HStack>
                </HStack>
            </Flex>

            {/* Kanban view vs Table view content block */}
            {viewType === 'kanban' ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    {['Applied', 'Interview', 'Offer', 'Rejected'].map((status) => {
                        const colApps = filteredApps.filter(app => app.status === status);
                        return (
                            <Box 
                                key={status} 
                                bg="rgba(241, 245, 249, 0.5)" 
                                p={4} 
                                borderRadius="2xl" 
                                border="1px solid" 
                                borderColor="rgba(226, 232, 240, 0.6)"
                                minH="450px"
                            >
                                <Flex align="center" justify="space-between" mb={4} pb={2} borderBottom="2px solid" borderBottomColor={`${getStatusColor(status)}.200`}>
                                    <HStack spacing={2}>
                                        <Box color={`${getStatusColor(status)}.500`}>
                                            {getStatusIcon(status)}
                                        </Box>
                                        <Text fontSize="sm" fontWeight="800" color="gray.700">{status}</Text>
                                    </HStack>
                                    <Badge colorScheme={getStatusColor(status)} borderRadius="full" px={2}>{colApps.length}</Badge>
                                </Flex>

                                <VStack spacing={3} align="stretch">
                                    {colApps.map((app) => (
                                        <Box
                                            key={app.id}
                                            bg="white"
                                            p={4}
                                            borderRadius="xl"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            shadow="sm"
                                            _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                                            transition="all 0.2s"
                                            position="relative"
                                        >
                                            <Heading size="xs" color="gray.850" fontWeight="800" mb={1} pr={6} isTruncated>
                                                {app.jobTitle || 'N/A'}
                                            </Heading>
                                            <Text fontSize="11px" color="gray.500" fontWeight="600" mb={2}>{app.company || 'N/A'}</Text>
                                            
                                            <Flex align="center" gap={1} mb={3.5} color="gray.400">
                                                <Calendar size={11} />
                                                <Text fontSize="9px" fontWeight="bold">{formatDate(app.appliedDate || app.createdAt)}</Text>
                                            </Flex>

                                            {/* Kanban Drag/Arrow status controls */}
                                            <Flex justify="space-between" align="center" borderTop="1px solid" borderColor="gray.50" pt={2.5}>
                                                <HStack spacing={1}>
                                                    <IconButton
                                                        icon={<ArrowLeft size={11} />}
                                                        size="xs"
                                                        onClick={() => moveStatusLeft(app)}
                                                        isDisabled={status === 'Applied'}
                                                        aria-label="Move back"
                                                        variant="ghost"
                                                    />
                                                    <IconButton
                                                        icon={<ArrowRight size={11} />}
                                                        size="xs"
                                                        onClick={() => moveStatusRight(app)}
                                                        isDisabled={status === 'Rejected'}
                                                        aria-label="Move forward"
                                                        variant="ghost"
                                                    />
                                                </HStack>
                                                
                                                <IconButton
                                                    icon={<Trash2 size={12} />}
                                                    size="xs"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteApplication(app.id)}
                                                    aria-label="Delete"
                                                />
                                            </Flex>
                                        </Box>
                                    ))}
                                    {colApps.length === 0 && (
                                        <Flex justify="center" align="center" minH="120px" border="2px dashed" borderColor="gray.200" borderRadius="xl">
                                            <Text fontSize="10px" color="gray.400" fontWeight="bold">Empty column</Text>
                                        </Flex>
                                    )}
                                </VStack>
                            </Box>
                        );
                    })}
                </SimpleGrid>
            ) : (
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    overflow="hidden"
                    overflowX="auto"
                    shadow="sm"
                >
                    <Table variant="simple">
                        <Thead bg={tableHeaderBg}>
                            <Tr>
                                <Th fontSize="xs" fontWeight="bold" color="gray.400">Job Title</Th>
                                <Th fontSize="xs" fontWeight="bold" color="gray.400">Company</Th>
                                <Th fontSize="xs" fontWeight="bold" color="gray.400">Date Applied</Th>
                                <Th fontSize="xs" fontWeight="bold" color="gray.400">Status</Th>
                                <Th fontSize="xs" fontWeight="bold" color="gray.400">Last Updated</Th>
                                <Th fontSize="xs" fontWeight="bold" color="gray.400">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredApps.map((app) => (
                                <Tr key={app.id} _hover={{ bg: tableHoverBg }}>
                                    <Td fontWeight="bold" fontSize="xs" color="gray.700">{app.jobTitle || 'N/A'}</Td>
                                    <Td fontSize="xs" color="gray.600" fontWeight="500">{app.company || 'N/A'}</Td>
                                    <Td fontSize="xs">
                                        <Flex alignItems="center" gap={1.5} color="gray.500">
                                            <Calendar size={13} />
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
                                            px={2.5}
                                            py={0.5}
                                            borderRadius="full"
                                            fontSize="10px"
                                            fontWeight="bold"
                                        >
                                            {getStatusIcon(app.status)}
                                            {app.status || 'N/A'}
                                        </Badge>
                                    </Td>
                                    <Td fontSize="xs" color="gray.500" fontWeight="500">
                                        {formatTimeAgo(app.updatedAt || app.createdAt)}
                                    </Td>
                                    <Td>
                                        <HStack spacing={2}>
                                            <Select
                                                value={app.status || 'Applied'}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                size="sm"
                                                width="120px"
                                                borderRadius="lg"
                                                bg={selectBg}
                                                fontSize="xs"
                                            >
                                                <option value="Applied">Applied</option>
                                                <option value="Interview">Interview</option>
                                                <option value="Offer">Offer</option>
                                                <option value="Rejected">Rejected</option>
                                            </Select>
                                            <IconButton
                                                icon={<Trash2 size={14} />}
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleDeleteApplication(app.id)}
                                                aria-label="Delete Application"
                                                borderRadius="lg"
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}

            {/* Vertical timeline activity history */}
            <Box mt={10}>
                <Heading 
                    size="sm" 
                    fontWeight="800" 
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    color="gray.700"
                    mb={6}
                >
                    Recent Activity Timeline
                </Heading>
                
                <Box position="relative" pl={6} _before={{
                    content: '""',
                    position: 'absolute',
                    left: '12px',
                    top: '8px',
                    bottom: '8px',
                    width: '2px',
                    bg: 'gray.200'
                }}>
                    <VStack spacing={5} align="stretch">
                        {applications.slice(0, 5).map((app) => (
                            <Box key={app.id} position="relative">
                                {/* Timeline Dot */}
                                <Box
                                    position="absolute"
                                    left="-22px"
                                    top="4px"
                                    w="14px"
                                    h="14px"
                                    borderRadius="full"
                                    bg={`${getStatusColor(app.status)}.500`}
                                    border="3px solid white"
                                    shadow="sm"
                                />
                                <Box
                                    bg={cardBg}
                                    p={4}
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor={borderColor}
                                    shadow="0 2px 8px rgba(0, 0, 0, 0.01)"
                                >
                                    <Flex justify="space-between" align="start" flexWrap="wrap" gap={2}>
                                        <Box>
                                            <Text fontSize="xs" fontWeight="800" color="gray.700">
                                                {app.jobTitle || 'Unknown Job'} at {app.company || 'Unknown Company'}
                                            </Text>
                                            <Text fontSize="10px" color="gray.500" mt={1}>
                                                Pipeline Status: <Badge colorScheme={getStatusColor(app.status)} fontSize="9px" borderRadius="full" px={2}>{app.status || 'N/A'}</Badge>
                                            </Text>
                                        </Box>
                                        <Text fontSize="9px" color="gray.400" fontWeight="bold">
                                            {formatTimeAgo(app.updatedAt || app.createdAt)}
                                        </Text>
                                    </Flex>
                                </Box>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            </Box>
        </Box>
    );
};

export default Applications;