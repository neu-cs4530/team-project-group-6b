import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import ProfileServiceClient from '../../classes/ProfileServiceClient';
import AuthenticatedUserContext from '../../contexts/AuthenticatedUserContext';
import { AuthenticatedUser } from '../../CoveyTypes';

const profileServiceClient = new ProfileServiceClient();

const AuthenticatedUserProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const { user, loginWithRedirect, isAuthenticated, isLoading, logout: azLogout, getAccessTokenSilently } =
    useAuth0();
  const logout = () => azLogout({returnTo: window.location.href})
  const [userInfo, setUserInfo] = useState<AuthenticatedUser>({
    isAuthenticated: false,
    token: '',
    logout: () => {},
    refresh: async () => {},
  });
  const [gotProfile, setGotProfile] = useState(false);
  const [shouldRegister, setShouldRegister] = useState(false);
  const refresh = async () => {
    const token = await getAccessTokenSilently();
    if (!isAuthenticated || !user || !user.email) {
      return;
    }
    try {
      const profileResponse = await profileServiceClient.getProfile({
        token,
        email: user.email || '',
      });
      setUserInfo({
        token,
        profile: {
          email: user.email,
          username: profileResponse.username,
          firstName: profileResponse.firstName,
          lastName: profileResponse.lastName,
          occupation: profileResponse.occupation,
          pronouns: profileResponse.pronouns,
          bio: profileResponse.bio,
        },
        isAuthenticated: true,
        logout,
        refresh,
      });
    } catch (err) {
      toast({
        title: 'Failed to refresh account.',
        description: 'Could not refresh account.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };
  useEffect(() => {
    (async () => {
      console.log("is loading: ", isLoading)
      if (isAuthenticated && user && user.email && !user.profile && !gotProfile) {
        const token = await getAccessTokenSilently();
        try {
          setGotProfile(true);
          const profileResponse = await profileServiceClient.getProfile({
            token,
            email: user.email || '',
          });
          setUserInfo({
            token,
            profile: {
              email: user.email,
              username: profileResponse.username,
              firstName: profileResponse.firstName,
              lastName: profileResponse.lastName,
              occupation: profileResponse.occupation,
              pronouns: profileResponse.pronouns,
              bio: profileResponse.bio,
            },
            isAuthenticated: true,
            logout,
            refresh,
          });
        } catch (err) {
          if (err.message.includes('404')) {
            setUserInfo({ ...userInfo, refresh });
            setShouldRegister(true);
          } else {
            toast({
              title: 'Fetch profile failed.',
              description: 'Could not fetch your profile.',
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
          }
        }
      }
      if (!isLoading && !isAuthenticated) {
        console.log("is logging in");
        await loginWithRedirect({ redirectUri: window.location.origin });
      }
    })();
  });
  return (
    <AuthenticatedUserContext.Provider value={userInfo}>
      {shouldRegister && <Redirect to='/register' />}
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

export default AuthenticatedUserProvider;
