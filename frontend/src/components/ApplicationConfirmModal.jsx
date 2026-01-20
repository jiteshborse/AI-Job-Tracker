import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    VStack,
    HStack,
    Badge,
    useColorModeValue
} from '@chakra-ui/react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ApplicationConfirmModal = () => {
    const { pendingConfirmation, handleApplicationConfirmation } = useApp();
    const isOpen = !!pendingConfirmation;
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const close = () => handleApplicationConfirmation('no');

    return (
        <Modal isOpen={isOpen} onClose={close} isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
                <ModalHeader bgGradient="linear(to-r, blue.500, purple.500)" color="white" py={4}>
                    Confirm Application
                </ModalHeader>
                <ModalBody py={5}>
                    <VStack align="start" spacing={3}>
                        <Text fontWeight="bold" fontSize="lg">
                            Did you apply?
                        </Text>
                        {pendingConfirmation && (
                            <VStack align="start" spacing={1}>
                                <Text fontSize="md" color="gray.700">
                                    {pendingConfirmation.jobTitle}
                                </Text>
                                <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                                    {pendingConfirmation.company}
                                </Badge>
                            </VStack>
                        )}
                        <Text fontSize="sm" color="gray.600">
                            Choose an option to keep your tracker accurate.
                        </Text>
                    </VStack>
                </ModalBody>
                <ModalFooter display="flex" flexDir="column" gap={2}>
                    <Button
                        w="full"
                        colorScheme="blue"
                        leftIcon={<CheckCircle size={16} />}
                        onClick={() => handleApplicationConfirmation('yes')}
                    >
                        Yes, Applied
                    </Button>
                    <HStack w="full">
                        <Button
                            w="full"
                            variant="outline"
                            leftIcon={<Clock size={16} />}
                            onClick={() => handleApplicationConfirmation('earlier')}
                        >
                            Applied Earlier
                        </Button>
                        <Button
                            w="full"
                            variant="ghost"
                            leftIcon={<XCircle size={16} />}
                            onClick={() => handleApplicationConfirmation('no')}
                        >
                            No, just browsing
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ApplicationConfirmModal;