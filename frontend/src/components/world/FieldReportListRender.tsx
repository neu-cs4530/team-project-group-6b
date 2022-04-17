import React, { useContext, useState } from 'react';
import CoveyAppContext from '../../contexts/CoveyAppContext';
import AuthenticatedUserContext from '../../contexts/AuthenticatedUserContext';
import ReportServiceClient from '../../classes/ReportServiceClient';

const reportServiceClient = new ReportServiceClient();

interface FieldReportList {
  reports: [];
}

function FieldReportListRender(): JSX.Element {
  const userContext = useContext(AuthenticatedUserContext);
  const [reportList, setReportList] = useState<FieldReportList | null>(null);

  const fetchReports = async () => {
    if (!userContext.profile) {
      console.log('returning');
      return;
    }
    try {
      const list = await reportServiceClient.getAllReportsByUser({
        token: userContext.token,
        username: userContext.profile.email,
      });
      setReportList(list);
    } catch (err) {
      console.log('no field reports');
    }
  };
  console.log(reportList);
  return <>{reportList}</>;
}

export default FieldReportListRender;
