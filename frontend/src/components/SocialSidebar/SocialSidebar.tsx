import {
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  StackDivider,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import FieldReportListRender from '../world/FieldReportListRender';
import ConversationAreasList from './ConversationAreasList';
import PlayersList from './PlayersList';

export default function SocialSidebar(): JSX.Element {
  const {
    isOpen: isOpenViewModal,
    onOpen: onOpenViewModal,
    onClose: onCloseViewModal,
  } = useDisclosure();
  return (
    <>
      <VStack
        align='left'
        spacing={2}
        border='2px'
        padding={2}
        marginLeft={2}
        borderColor='gray.500'
        height='100%'
        divider={<StackDivider borderColor='gray.200' />}
        borderRadius='4px'>
        <Heading fontSize='xl' as='h1'>
          Players In This Town
        </Heading>
        <PlayersList />
        <ConversationAreasList />
        <Button onClick={onOpenViewModal} style={{ marginRight: '10px' }}>
          View Reports
        </Button>
      </VStack>
      <Modal isOpen={isOpenViewModal} onClose={onCloseViewModal} scrollBehavior='inside'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Field reports:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FieldReportListRender />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
