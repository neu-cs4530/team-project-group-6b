import React, { useContext, useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import FieldReportsNotepadDrawer from './FieldReportsNotepadDrawer';
import CoveyAppContext from '../../contexts/CoveyAppContext';
import AuthenticatedUserContext from '../../contexts/AuthenticatedUserContext';
import ProfileServiceClient from '../../classes/ProfileServiceClient';

const profileServiceClient = new ProfileServiceClient();

function FieldReportCreator() {
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const appContext = useContext(CoveyAppContext);
  const userContext = useContext(AuthenticatedUserContext);
  const toast = useToast();
  const handleSubmit = async (text: string) => {
    if (!appContext) {
      return;
    }
    try {
      await profileServiceClient.postFieldReport({
        token: userContext.token,
        text,
        sessionId: appContext.sessionToken,
      });
      toast({
        title: 'Successfully Saved Field Report',
        description: 'Successfully saved field report',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error Posting Field Report',
        description: 'There was an error posting your field report, please try again',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };
  return (
    <>
      <FieldReportsNotepadDrawer
        onSubmit={handleSubmit}
        onClose={() => setIsNotepadOpen(false)}
        isOpen={isNotepadOpen}
      />
      <Button colorScheme='blue' onClick={() => setIsNotepadOpen(!isNotepadOpen)}>
        Field Report
      </Button>
    </>
  );
}

export default FieldReportCreator;
