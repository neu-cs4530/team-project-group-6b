import { Heading } from '@chakra-ui/react';
import { Card, CardHeader } from '@material-ui/core';
import React from 'react';
import { FieldReportListResponse } from '../classes/ReportServiceClient';
import MarkdownRenderer from './MarkdownRenderer';

function FieldReportsViewer(props: { fieldReports: FieldReportListResponse[] }) {
  const { fieldReports } = props;
  return (
    <div>
      {' '}
      {fieldReports.map(report => (
        <Card
          key={`${report.time}${report.sessionID}`}
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
              </div>
            }
          />
          <MarkdownRenderer markdown={report.fieldReports} />
          <CardHeader />
        </Card>
      ))}
    </div>
  );
}

export default FieldReportsViewer;
