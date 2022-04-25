import {
  Button,
  Divider,
  Heading,
  Icon,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { Card, CardHeader } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import FieldReportsServiceClient from '../classes/ReportServiceClient';
import AuthenticatedUserContext from '../contexts/AuthenticatedUserContext';
import MarkdownRenderer from './MarkdownRenderer';
import FieldReportCreator from './world/FieldReportCreator';

const reportService = new FieldReportsServiceClient();

interface FieldReport {
  username: string;
  fieldReports: string;
  sessionID: string;
  time: string;
  isPrivate: boolean;
}

function EditFieldReports() {
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([]);
  const [didFetch, setDidFetch] = useState(false);
  const userContext = useContext(AuthenticatedUserContext);
  const toast = useToast();

  useEffect(() => {
    if (!didFetch) {
      (async () => {
        if (!userContext.profile) {
          return;
        }
        try {
          const reports = await reportService.listAllFieldReports({
            username: userContext.profile?.email,
            token: userContext.token,
          });
          setFieldReports(reports);
        } catch (err) {
          toast({
            title: 'Error fetching notes.',
            description: 'Please try again.',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      })();
    }
    setDidFetch(true);
  }, [didFetch, toast, userContext.profile, userContext.token]);

  const handleDelete = async (sessionId: string) => {
    try {
      await reportService.deleteFieldReport({
        sessionID: sessionId,
        token: userContext.token,
      });
      toast({
        title: 'Successfully Deleted Note',
        description: 'Successfully deleted note',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
      setFieldReports(fieldReports.filter(fr => fr.sessionID !== sessionId));
    } catch (err) {
      toast({
        title: 'Error Deleting Note',
        description: 'There was an error deleting your note, please try again',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const togglePrivacy = async (sessionId: string) => {
    const foundReport = fieldReports.find(fr => fr.sessionID === sessionId);
    if (!foundReport) {
      toast({
        title: 'Error Changing Privacy on Note',
        description: 'There was an error changing privacy on your note, please try again',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    try {
      await reportService.updateFieldReport({
        sessionID: sessionId,
        token: userContext.token,
        username: userContext.profile?.email || '',
        isPrivate: !foundReport.isPrivate,
      });
      toast({
        title: 'Successfully Toggled Privacy',
        description: 'Successfully toggled note privacy',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
      setFieldReports(
        fieldReports.map(fr =>
          fr.sessionID === sessionId ? { ...fr, isPrivate: !fr.isPrivate } : fr,
        ),
      );
    } catch (err) {
      toast({
        title: 'Error Setting Note Privacy',
        description: 'There was an error setting note privacy, please try again',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const [sortNewest, setSortNewest] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingSession, setCurrentEditingSession] = useState('');
  return (
    <div>
      <Button onClick={() => setSortNewest(!sortNewest)}>
        Sorting By: {sortNewest ? 'Newest' : 'Oldest'}
      </Button>
      {fieldReports
        .sort((a, b) => {
          const bdate = Date.parse(b.time);
          const adate = Date.parse(a.time);
          return sortNewest ? bdate - adate : adate - bdate;
        })
        .map(report => (
          <Card
            key={report.sessionID}
            variant='elevation'
            elevation={3}
            style={{ marginBottom: 30 }}>
            <CardHeader
              title={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1em',
                    fontWeight: 'lighter',
                  }}>
                  {' '}
                  <Heading size='sm' style={{ lineHeight: 2.5 }}>
                    Note From: {new Date(report.time).toLocaleString('en-US')}
                  </Heading>
                  <div>
                    private 
                    <Switch
                      isChecked={report.isPrivate !== undefined ? report.isPrivate : false}
                      onChange={() => togglePrivacy(report.sessionID)}>
                    </Switch>
                    <IconButton
                      aria-label='edit'
                      icon={<Icon as={MdEdit} />}
                      onClick={() => {
                        setIsEditing(true);
                        setCurrentEditingSession(report.sessionID);
                      }}
                    />
                    <Popover>
                      <PopoverTrigger>
                        <IconButton
                          aria-label='delete'
                          icon={<Icon as={MdDeleteOutline} color='red' />}
                        />
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Delete this note?</PopoverHeader>
                        <PopoverBody>
                          <Button onClick={() => handleDelete(report.sessionID)} color='red'>
                            Delete
                          </Button>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              }
            />
            <Divider />
            <MarkdownRenderer markdown={report.fieldReports} />

            <CardHeader />
          </Card>
        ))}
      {isEditing && (
        <FieldReportCreator
          onSaveSuccess={(text: string) => {
            setIsEditing(false);
            setFieldReports(
              fieldReports.map(fr =>
                fr.sessionID === currentEditingSession ? { ...fr, fieldReports: text } : fr,
              ),
            );
          }}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          sessionId={currentEditingSession}
          showButton={false}
        />
      )}
    </div>
  );
}

export default EditFieldReports;
