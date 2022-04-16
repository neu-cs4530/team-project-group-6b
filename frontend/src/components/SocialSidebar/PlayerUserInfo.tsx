import { useAuth0 } from '@auth0/auth0-react';
import { Modal, ModalCloseButton, ModalHeader, ModalOverlay, Tooltip, useDisclosure } from '@chakra-ui/react';
import React, { JSXElementConstructor, useEffect, useState } from 'react';
import { JsxElement } from 'typescript';
import Player from '../../classes/Player';
import ProfileServiceClient from '../../classes/ProfileServiceClient';
import { IUserProfile } from '../../CoveyTypes';

type PlayerNameProps = {
  player: Player;
};

const profileServiceClient = new ProfileServiceClient();

export default function PlayerUserInfo({ player }: PlayerNameProps): JSX.Element {
  const [userInfo, setUserInfo] = useState<IUserProfile | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    (async () => {
      const token = await getAccessTokenSilently();
      console.log('getting profile');
      const playerInfo = await profileServiceClient.getProfileByUsername({
        token,
        username: player.userName,
      });
      setUserInfo(playerInfo);
    })();
  }, [player, profileServiceClient, getAccessTokenSilently]);

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

