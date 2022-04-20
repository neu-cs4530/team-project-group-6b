import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import FieldReportsNotepadDrawer from './FieldReportsNotepadDrawer';
import AuthenticatedUserContext from '../../contexts/AuthenticatedUserContext';
import useMaybeVideo from '../../hooks/useMaybeVideo';
import ReportServiceClient from '../../classes/ReportServiceClient';

const reportServiceClient = new ReportServiceClient();
interface FieldReport {
  username: string;
  fieldReports: string;
  sessionID: string;
  time: string;
}

function FieldReportCreator(props: {
  sessionId: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSaveSuccess?: (text: string) => void;
}) {
  const { sessionId, isOpen, onClose, onSaveSuccess } = props;
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const userContext = useContext(AuthenticatedUserContext);
  const toast = useToast();
  const video = useMaybeVideo();
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<FieldReport | null>(null);
  const [gotReport, setGotReport] = useState(false);
  const fetchReport = useCallback(async () => {
    if (!userContext.profile) {
      return;
    }
    try {
      setIsLoading(true);
      const report = await reportServiceClient.listFieldReport({
        token: userContext.token,
        username: userContext.profile.email,
        sessionID: sessionId,
      });
      setCurrentReport(report);
      setIsLoading(false);
    } catch (err) {
      if (err.message.includes('404')) {
        setIsLoading(false);
      }
    }
  }, [sessionId, userContext.profile, userContext.token]);

  useEffect(() => {
    if (!gotReport) {
      fetchReport();
      setGotReport(true);
    }
  }, [gotReport, fetchReport]);

  const handleSubmit = async (text: string) => {
    if (!userContext.profile) {
      return;
    }
    try {
      if (!currentReport) {
        await reportServiceClient.createFieldReport({
          token: userContext.token,
          fieldReports: text,
          sessionID: sessionId,
          time: new Date().toUTCString(),
        });
      } else {
        await reportServiceClient.updateFieldReport({
          username: userContext.profile.email,
          sessionID: sessionId,
          fieldReports: text,
          token: userContext.token,
        });
      }
      toast({
        title: 'Successfully Saved Field Report',
        description: 'Successfully saved field report',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
      if (onSaveSuccess) onSaveSuccess(text);
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
          if (onClose) {
            onClose();
          }
          video?.unPauseGame();
          setIsNotepadOpen(false);
        }}
        isOpen={isOpen !== undefined ? isOpen : isNotepadOpen}
      />
      <Button
        disabled={isLoading}
        colorScheme='blue'
        onClick={async () => {
          video?.pauseGame();
          await fetchReport();
          setIsNotepadOpen(true);
        }}>
        {isLoading ? 'Loading...' : 'Field Report'}
      </Button>
    </>
  );
}

FieldReportCreator.defaultProps = {
  isOpen: undefined,
  onClose: undefined,
  onSaveSuccess: undefined,
};

export default FieldReportCreator;
