import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    VStack,
    Text,
    Box,
    Flex,
    Icon,
    useColorModeValue,
    Progress,
    Alert,
    AlertIcon,
    Badge
} from '@chakra-ui/react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ResumeUploadModal = () => {
    const { showResumeUpload, setShowResumeUpload, userResume, uploadResume, isFirstLogin } = useApp();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const dragBg = useColorModeValue('blue.50', 'blue.900');
    
    // Can only close if not first login or if resume exists
    const canClose = !isFirstLogin || !!userResume;

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
            setFile(selectedFile);
        } else {
            alert('Please upload a PDF or TXT file');
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);

        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain')) {
            setFile(droppedFile);
        } else {
            alert('Please upload a PDF or TXT file');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            await uploadResume(file);
            setUploadSuccess(true);
            setFile(null);
            // Auto-close after brief success indication
            setTimeout(() => {
                setShowResumeUpload(false);
                setUploadSuccess(false);
            }, 1500);
        } catch (error) {
            setUploadSuccess(false);
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (canClose) {
            setShowResumeUpload(false);
            setFile(null);
            setUploadSuccess(false);
        }
    };

    return (
        <Modal
            isOpen={showResumeUpload}
            onClose={handleClose}
            isCentered
            size={{ base: 'full', md: 'md' }}
            closeOnOverlayClick={canClose}
            closeOnEsc={canClose}
        >
            <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.400" />
            <ModalContent
                borderRadius={{ base: '0', md: '2xl' }}
                overflow="hidden"
                boxShadow="2xl"
                maxH={{ base: '100vh', md: '90vh' }}
            >
                <ModalHeader
                    bgGradient="linear(to-r, blue.500, purple.500)"
                    color="white"
                    py={{ base: 3, md: 4 }}
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight="bold"
                >
                    <Flex alignItems="center" gap={2}>
                        <Box
                            w={8}
                            h={8}
                            borderRadius="lg"
                            bg="whiteAlpha.300"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Upload size={16} />
                        </Box>
                        <Box flex="1">
                            {userResume ? 'Update Your Resume' : 'Upload Your Resume'}
                        </Box>
                        {isFirstLogin && !userResume && (
                            <Badge colorScheme="red" fontSize="xs" borderRadius="full" px={2}>
                                Required
                            </Badge>
                        )}
                    </Flex>
                </ModalHeader>

                <ModalBody py={{ base: 4, md: 5 }} px={{ base: 4, md: 5 }}>
                    <VStack spacing={4}>
                        {isFirstLogin && !userResume && (
                            <Alert status="warning" borderRadius="lg" variant="left-accent" py={3} bg="orange.50" borderColor="orange.300">
                                <AlertIcon boxSize={4} />
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm">Get Started with AI Job Matching</Text>
                                    <Text fontSize="xs" color="gray.600" mt={1}>
                                        Upload your resume to unlock personalized job matching and insights based on your skills and experience.
                                    </Text>
                                </Box>
                            </Alert>
                        )}
                        {!userResume && !isFirstLogin && (
                            <Alert status="info" borderRadius="lg" variant="left-accent" py={2}>
                                <AlertIcon boxSize={4} />
                                <Text fontSize="xs">
                                    Upload your resume to get AI-powered job matching scores!
                                </Text>
                            </Alert>
                        )}

                        <Box
                            border="2px"
                            borderStyle="dashed"
                            borderColor={dragOver ? 'blue.500' : borderColor}
                            borderRadius="xl"
                            p={{ base: 6, md: 8 }}
                            textAlign="center"
                            bg={dragOver ? dragBg : 'transparent'}
                            w="full"
                            onDrop={handleDrop}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            cursor="pointer"
                            onClick={() => document.getElementById('fileInput').click()}
                            transition="all 0.3s ease"
                            _hover={{
                                borderColor: 'blue.400',
                                bg: useColorModeValue('blue.50', 'blue.900'),
                                transform: 'scale(1.01)'
                            }}
                        >
                            <input
                                id="fileInput"
                                type="file"
                                accept=".pdf,.txt"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />

                            <Box
                                w={14}
                                h={14}
                                borderRadius="full"
                                bg="blue.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mx="auto"
                                mb={3}
                                transition="all 0.3s ease"
                                _hover={{ transform: 'scale(1.1)' }}
                            >
                                <Icon as={Upload} w={7} h={7} color="blue.500" />
                            </Box>

                            <Text fontWeight="bold" mb={1} fontSize="md">
                                Drag & drop your resume here
                            </Text>

                            <Text color="gray.500" fontSize="sm" mb={3}>
                                or click to browse files
                            </Text>

                            <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                Supported formats: PDF, TXT (Max 5MB)
                            </Text>
                        </Box>

                        {file && (
                            <Box
                                w="full"
                                p={3}
                                borderWidth="2px"
                                borderRadius="lg"
                                bgGradient="linear(to-r, blue.50, purple.50)"
                                borderColor="blue.200"
                                shadow="sm"
                                animation="slideIn 0.3s ease"
                            >
                                <Flex alignItems="center" gap={2}>
                                    <Box
                                        w={10}
                                        h={10}
                                        borderRadius="lg"
                                        bg="blue.100"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon as={FileText} w={5} h={5} color="blue.500" />
                                    </Box>
                                    <Box flex="1">
                                        <Text fontWeight="bold" fontSize="sm">{file.name}</Text>
                                        <Text fontSize="xs" color="gray.600">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                                        </Text>
                                    </Box>
                                    <Box
                                        w={8}
                                        h={8}
                                        borderRadius="full"
                                        bg="green.100"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon as={CheckCircle} w={5} h={5} color="green.500" />
                                    </Box>
                                </Flex>

                                {uploading && (
                                    <Box mt={3}>
                                        <Progress
                                            size="sm"
                                            isIndeterminate
                                            colorScheme="blue"
                                            borderRadius="full"
                                            bg="blue.100"
                                        />
                                        <Text fontSize="xs" textAlign="center" mt={1.5} fontWeight="medium" color="blue.600">
                                            Uploading and processing...
                                        </Text>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {uploadSuccess && (
                            <Alert status="success" borderRadius="lg" variant="left-accent" bg="green.50" py={3}>
                                <AlertIcon boxSize={5} />
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm">Resume Uploaded Successfully!</Text>
                                    <Text fontSize="xs" color="gray.600" mt={1}>
                                        Your resume is ready for AI-powered job matching.
                                    </Text>
                                </Box>
                            </Alert>
                        )}
                        {userResume && !uploadSuccess && (
                            <Alert status="success" borderRadius="lg" variant="left-accent" bg="green.50" py={2}>
                                <AlertIcon boxSize={4} />
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm">Current Resume Uploaded</Text>
                                    <Text fontSize="xs" color="gray.600">
                                        {userResume.textLength} characters extracted
                                    </Text>
                                </Box>
                            </Alert>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter gap={2} py={{ base: 3, md: 4 }} px={{ base: 4, md: 5 }} bg={useColorModeValue('gray.50', 'gray.900')} borderTop="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                    {canClose && (
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            size="sm"
                            borderRadius="lg"
                            fontWeight="medium"
                        >
                            {userResume ? 'Skip for now' : 'Cancel'}
                        </Button>
                    )}
                    <Button
                        colorScheme="blue"
                        onClick={handleUpload}
                        isLoading={uploading}
                        isDisabled={!file || uploadSuccess}
                        leftIcon={<Upload size={16} />}
                        size="sm"
                        borderRadius="lg"
                        fontWeight="bold"
                        bgGradient="linear(to-r, blue.500, purple.500)"
                        _hover={{
                            bgGradient: 'linear(to-r, blue.600, purple.600)',
                            transform: 'translateY(-2px)',
                            shadow: 'lg'
                        }}
                        transition="all 0.2s ease"
                        px={6}
                        _disabled={{
                            opacity: 0.5,
                            cursor: 'not-allowed'
                        }}
                    >
                        {uploadSuccess ? '✓ Uploaded' : (userResume ? 'Update Resume' : 'Upload Resume')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ResumeUploadModal;