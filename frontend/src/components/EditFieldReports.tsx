import { Card, CardHeader } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { IconButton, Icon } from '@chakra-ui/react';
import { MdEdit } from 'react-icons/md';
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
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingSession, setCurrentEditingSession] = useState('');
  return (
    <div>
      {fieldReports.map(report => (
        <Card key={report.sessionID} variant='elevation' elevation={3} style={{ marginBottom: 30 }}>
          <CardHeader
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {' '}
                Report From: {report.time}
                <IconButton
                  aria-label='edit'
                  icon={<Icon as={MdEdit} />}
                  style={{ marginLeft: '50px' }}
                  onClick={() => {
                    setIsEditing(true);
                    setCurrentEditingSession(report.sessionID);
                  }}
                />
              </div>
            }
          />
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
