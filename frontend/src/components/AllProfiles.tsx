import {
  Divider,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import ProfileServiceClient from '../classes/ProfileServiceClient';
import ReportServiceClient, { FieldReportListResponse } from '../classes/ReportServiceClient';
import AuthenticatedUserContext from '../contexts/AuthenticatedUserContext';
import FieldReportsViewer from './FieldReportsViewer';

interface IUserProfile {
  firstName: string;
  lastName: string;
  username: string;
  pronouns: string;
  occupation: string;
  bio: string;
  email: string;
}

const profileService = new ProfileServiceClient();
const reportService = new ReportServiceClient();

function AllProfiles() {
  const authedUser = useContext(AuthenticatedUserContext);
  const [profiles, setProfiles] = useState<IUserProfile[]>([]);
  const toast = useToast();

  useEffect(() => {
    if (authedUser.isAuthenticated) {
      (async () => {
        try {
          const profilesResponse = await profileService.getAllProfiles({ token: authedUser.token });
          setProfiles(profilesResponse);
        } catch {
          toast({
            title: 'Error Fetching Profiles',
            description: 'Failed to fetch profiles, please try again',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      })();
    }
  }, [authedUser, toast]);
  const [reports, setReports] = useState<FieldReportListResponse[]>([]);
  const [viewingReports, setViewingReports] = useState(false);
  const [reportsUser, setReportsUser] = useState<IUserProfile | null>();

  useEffect(() => {
    if (viewingReports) {
      (async () => {
        try {
          const reportsResponse = await reportService.listAllFieldReports({
            username: reportsUser?.email || '',
            token: authedUser.token,
          });
          setReports(reportsResponse);
        } catch (err) {
          toast({
            title: 'Error Fetching Reports',
            description: 'Failed to fetch reports, please try again later',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      })();
    }
  }, [authedUser.token, reportsUser?.email, toast, viewingReports]);
  return (
    <>
      <Modal
        isOpen={viewingReports}
        onClose={() => setViewingReports(false)}
        scrollBehavior='inside'
        size='4xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Viewing Notes for: {reportsUser?.firstName} {reportsUser?.lastName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FieldReportsViewer fieldReports={reports} />{' '}
          </ModalBody>
        </ModalContent>
      </Modal>

      <div>
        <Heading size='lg' style={{ padding: '10px 50px' }}>
          Profiles
        </Heading>
        <div
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '30px',
            justifyContent: 'center',
            padding: '25px  150px',
          }}>
          {profiles.map(prof => (
            <Card
              key={prof.username}
              style={{ maxWidth: 250 }}
              onClick={() => {
                setViewingReports(true);
                setReportsUser(prof);
              }}>
              <CardHeader
                title={
                  <Heading size='sm' style={{ lineHeight: 1 }}>
                    {prof.firstName} {prof.lastName} ({prof.username}) <i>{prof.pronouns}</i>
                  </Heading>
                }
              />
              <CardContent>
                <Divider />
                {prof.bio}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

export default AllProfiles;
