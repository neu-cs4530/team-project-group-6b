import {
  IconButton,
  Icon,
  PopoverTrigger,
  Popover,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Button,
  useToast,
  Divider,
  Heading,
} from '@chakra-ui/react';
import { MdEdit, MdDeleteOutline } from 'react-icons/md';
import { Card, CardHeader } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import AuthenticatedUserContext from '../contexts/AuthenticatedUserContext';
import FieldReportsServiceClient from '../classes/ReportServiceClient';
import MarkdownRenderer from './MarkdownRenderer';
import FieldReportCreator from './world/FieldReportCreator';

const reportService = new FieldReportsServiceClient();

interface FieldReport {
  username: string;
  fieldReports: string;
  sessionID: string;
  time: string;
}

function EditFieldReports() {
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([]);
  const [didFetch, setDidFetch] = useState(false);
  const userContext = useContext(AuthenticatedUserContext);

  const getFieldReports = async () => {
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
      console.log('error getting field reports: ', err);
    }
  };

  useEffect(() => {
    if (!didFetch) {
      getFieldReports();
    }
    setDidFetch(true);
  });

  const toast = useToast();
  const handleDelete = async (sessionId: string) => {
    try {
      await reportService.deleteFieldReport({
        sessionID: sessionId,
        token: userContext.token,
        username: userContext.profile?.email || '',
      });
      toast({
        title: 'Successfully Deleted Field Report',
        description: 'Successfully deleted field report',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error Deleting Field Report',
        description: 'There was an error deleting your field report, please try again',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
    setFieldReports(fieldReports.filter(fr => fr.sessionID !== sessionId));
    console.log('deleting session: ', sessionId);
  };
  const [sortNewest, setSortNewest] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingSession, setCurrentEditingSession] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentDeletingSelection, setCurrentDeletingSelection] = useState('');
  return (
    <div>
      <Button onClick={() => setSortNewest(!sortNewest)}>
        Sorting By: {sortNewest ? 'Newest' : 'Oldest'}
      </Button>
      {fieldReports
        .sort((a, b) => {
          const bdate = Date.parse(b.time);
          const adate = Date.parse(a.time);
          console.log(adate, bdate, bdate - adate);
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
                    Report From: {new Date(report.time).toLocaleString('en-US')}
                  </Heading>
                  <div>
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
                        <PopoverHeader>Delete this field report?</PopoverHeader>
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
        />
      )}
    </div>
  );
}

export default EditFieldReports;
