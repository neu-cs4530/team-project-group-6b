import { useAuth0 } from '@auth0/auth0-react';
import {
  Heading,
  Icon,
  IconButton,
  Modal,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Card, CardHeader } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import Player from '../../classes/Player';
import ProfileServiceClient from '../../classes/ProfileServiceClient';
import { IUserProfile } from '../../CoveyTypes';
import MarkdownRenderer from '../MarkdownRenderer';
import FieldReportsServiceClient from '../../classes/ReportServiceClient';
import FieldReportsViewer from '../FieldReportsViewer';

type PlayerNameProps = {
  player: Player;
};

interface FieldReport {
  username: string;
  fieldReports: string;
  sessionID: string;
  time: string;
  isPrivate: boolean;
}

const profileServiceClient = new ProfileServiceClient();

export default function PlayerUserInfo({ player }: PlayerNameProps): JSX.Element {
  const [userInfo, setUserInfo] = useState<IUserProfile | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    (async () => {
      const token = await getAccessTokenSilently();
      const playerInfo = await profileServiceClient.getProfileByUsername({
        token,
        username: player.userName,
      });
      setUserInfo(playerInfo);
    })();
  }, [setUserInfo, player, getAccessTokenSilently]);

  let userInfoString = '';
  if (userInfo !== null) {
    userInfoString = userInfo.username;

    if (userInfo.pronouns) {
      userInfoString += ` (${userInfo.pronouns})`;
    }

    if (userInfo.occupation) {
      userInfoString += ` - ${userInfo.occupation}`;
    }
  }

  return <Tooltip label={userInfo?.bio}>{userInfoString}</Tooltip>;
}

const reportService = new FieldReportsServiceClient();

export function RenderFieldReportByUser({ player }: PlayerNameProps) {
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([]);
  const [didFetch, setDidFetch] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  useEffect(() => {
    if (!didFetch) {
      (async () => {
        const token = await getAccessTokenSilently();
        try {
          const playerInfo = await profileServiceClient.getProfileByUsername({
            token,
            username: player.userName,
          });
          if (!playerInfo) {
            return;
          }
          const reports = await reportService.listAllFieldReports({
            username: playerInfo.email,
            token,
          });
          setFieldReports(reports);
        } catch (err) {
          toast({
            title: 'Error fetching reports',
            description: 'Please try again.',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      })();
    }
    setDidFetch(true);
  }, [didFetch, getAccessTokenSilently, player.userName, toast]);

  return (
    <div>
      <FieldReportsViewer fieldReports={fieldReports} />
    </div>
  );
}
