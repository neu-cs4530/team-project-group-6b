import React, { useContext, useEffect, useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import FieldReportsNotepadDrawer from './FieldReportsNotepadDrawer';
import CoveyAppContext from '../../contexts/CoveyAppContext';
import AuthenticatedUserContext from '../../contexts/AuthenticatedUserContext';
import useMaybeVideo from '../../hooks/useMaybeVideo';
import ReportServiceClient from '../../classes/ReportServiceClient';

const reportServiceClient = new ReportServiceClient();
interface FieldReport {
  username: string;
  fieldReports: string;
  sessionID: string;
  time: number;
}

function FieldReportCreator() {
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const appContext = useContext(CoveyAppContext);
  const userContext = useContext(AuthenticatedUserContext);
  const toast = useToast();
  const video = useMaybeVideo();
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<FieldReport | null>(null);
  const [gotReport, setGotReport] = useState(false);
  const fetchReport = async () => {
    if (!userContext.profile || !appContext) {
      console.log('returning');
      return;
    }
    try {
      setIsLoading(true);
      const report = await reportServiceClient.listFieldReport({
        token: userContext.token,
        username: userContext.profile.email,
        sessionID: appContext?.sessionToken,
      });
      setCurrentReport(report);
      setIsLoading(false);
    } catch (err) {
      if (err.message.includes('404')) {
        setIsLoading(false);
        console.log('no field report');
      }
    }
  };

  useEffect(() => {
    if (!gotReport) {
      fetchReport();
      setGotReport(true);
    }
  });

  const handleSubmit = async (text: string) => {
    if (!appContext || !userContext.profile) {
      return;
    }
    try {
      if (!currentReport) {
        await reportServiceClient.createFieldReport({
          token: userContext.token,
          fieldReports: text,
          sessionID: appContext.sessionToken,
          time: new Date().getUTCDate(),
        });
      } else {
        await reportServiceClient.updateFieldReport({
          username: userContext.profile.email,
          sessionID: appContext.sessionToken,
          fieldReports: text,
        });
      }
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
        fieldReports={currentReport?.fieldReports}
        onSubmit={handleSubmit}
        onClose={() => {
          video?.unPauseGame();
          setIsNotepadOpen(false);
        }}
        isOpen={isNotepadOpen}
      />
      <Button
        disabled={isLoading}
        colorScheme='blue'
        onClick={async () => {
          console.log(video);
          video?.pauseGame();
          await fetchReport();
          setIsNotepadOpen(true);
        }}>
        {isLoading ? 'Loading...' : 'Field Report'}
      </Button>
    </>
  );
}

export default FieldReportCreator;
