import { useAuth0 } from '@auth0/auth0-react';
import { Tooltip } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
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
