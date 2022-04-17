import {
  Box,
  Heading,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import Player from '../../classes/Player';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import usePlayersInTown from '../../hooks/usePlayersInTown';
import PlayerUserInfo, { RenderFieldReportByUser } from './PlayerUserInfo';

/**
 * Lists the current players in the town, along with the current town's name and ID
 *
 * See relevant hooks: `usePlayersInTown` and `useCoveyAppState`
 *
 */
export default function PlayersInTownList(): JSX.Element {
  const players = usePlayersInTown();
  const { currentTownFriendlyName, currentTownID } = useCoveyAppState();
  const sorted = players.concat([]);
  const [modalUser, setModalUser] = useState<Player | undefined>();

  const { onOpen, isOpen, onClose } = useDisclosure();
  sorted.sort((p1, p2) =>
    p1.userName.localeCompare(p2.userName, undefined, { numeric: true, sensitivity: 'base' }),
  );

  return (
    <>
      <Box>
        <Tooltip label={`Town ID: ${currentTownID}`}>
          <Heading as='h2' fontSize='l'>
            Current town: {currentTownFriendlyName}
          </Heading>
        </Tooltip>
        <OrderedList>
          {sorted.map(player => (
            <>
              <ListItem
                key={player.id}
                onClick={() => {
                  setModalUser(player);
                  onOpen();
                }}>
                <PlayerUserInfo player={player} />
              </ListItem>
              <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
                <ModalOverlay />
                {modalUser ? (
                  <ModalContent>
                    <ModalHeader>
                      {modalUser.userName}
                      {`'`}s reports
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <RenderFieldReportByUser player={modalUser} />
                    </ModalBody>
                  </ModalContent>
                ) : (
                  <ModalContent>
                    <ModalHeader>null</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>null</ModalBody>
                  </ModalContent>
                )}
              </Modal>
            </>
          ))}
        </OrderedList>
      </Box>
    </>
  );
}
