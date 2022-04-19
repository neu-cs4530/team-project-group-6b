import { Heading, StackDivider, VStack } from '@chakra-ui/react';
import React, { useContext } from 'react';
import FieldReportCreator from '../world/FieldReportCreator';
import ConversationAreasList from './ConversationAreasList';
import PlayersList from './PlayersList';
import CoveyAppContext from '../../contexts/CoveyAppContext';

export default function SocialSidebar(): JSX.Element {
  const coveyAppContext = useContext(CoveyAppContext);
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
        {coveyAppContext ? <FieldReportCreator sessionId={coveyAppContext.sessionToken} /> : ''}
      </VStack>
    </>
  );
}
