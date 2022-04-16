import { Box, Heading, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, OrderedList, Tooltip, useDisclosure } from '@chakra-ui/react';
import React, { useState } from 'react';
import Player from '../../classes/Player';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import usePlayersInTown from '../../hooks/usePlayersInTown';
import PlayerUserInfo from './PlayerUserInfo';

/**
 * Lists the current players in the town, along with the current town's name and ID
 * 
 * See relevant hooks: `usePlayersInTown` and `useCoveyAppState` 
 * 
 */
export default function PlayersInTownList(): JSX.Element {
  const players = usePlayersInTown();
  const { currentTownFriendlyName, currentTownID } = useCoveyAppState();
  const { onOpen, isOpen, onClose } = useDisclosure();
  const sorted = players.concat([]);
  let curPlayer: Player | undefined;
  sorted.sort((p1, p2) => p1.userName.localeCompare(p2.userName, undefined, {numeric: true, sensitivity: 'base'}));
  
  return (
    <>
    <Box><Tooltip label={`Town ID: ${currentTownID}`}>
      <Heading as='h2' fontSize='l'>
        Current town: {currentTownFriendlyName}
      </Heading></Tooltip>
      <OrderedList>
        {sorted.map(player => {
          curPlayer = player;
          return <ListItem key={player.id} onClick={() => {onOpen(); }}>
            <PlayerUserInfo player={player}/> 
          </ListItem>
        }
        )}
      </OrderedList>
      <Modal isOpen={isOpen} onClose={onClose} 
        scrollBehavior='inside'>
          <ModalOverlay />
          <ModalContent>
          <ModalHeader>User information</ModalHeader>
          <ModalCloseButton />
          {curPlayer? 
          <ModalBody>
            {curPlayer.userName}
            <ul>
              <li> userReport 1</li>
              <li> userReport 2</li>
              </ul>
          </ModalBody> :
           <ModalBody>
            no player found
          </ModalBody>
          }
          </ModalContent>
    </Modal>
    </Box>
  </>
  );
}