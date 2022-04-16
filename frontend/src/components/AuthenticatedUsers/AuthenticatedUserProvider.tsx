import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import ProfileServiceClient from '../../classes/ProfileServiceClient';
import AuthenticatedUserContext from '../../contexts/AuthenticatedUserContext';
import { AuthenticatedUser } from '../../CoveyTypes';

const profileServiceClient = new ProfileServiceClient();

const AuthenticatedUserProvider: React.FC = ({ children }) => {
  const {
    user,
    loginWithRedirect,
    isAuthenticated,
    isLoading,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const [userInfo, setUserInfo] = useState<AuthenticatedUser>({
    isAuthenticated: false,
    token: '',
    logout: () => {},
    refresh: async () => {
      console.log('old refresh');
    },
  });
  console.log('USER: ', user);
  const [gotProfile, setGotProfile] = useState(false);
  const [shouldRegister, setShouldRegister] = useState(false);
  const refresh = async () => {
    const token = await getAccessTokenSilently();
    console.log('refresh 1');
    if (!isAuthenticated || !user || !user.email) {
      return;
    }
    console.log('refresh 2');
    try {
      const profileResponse = await profileServiceClient.getProfile({
        token,
        email: user.email || '',
      });
      console.log(profileResponse);
      setUserInfo({
        token,
        profile: {
          email: user.email,
          username: profileResponse.username,
          firstName: profileResponse.firstName,
          lastName: profileResponse.lastName,
        },
        isAuthenticated: true,
        logout,
        refresh,
      });
    } catch (err) {
      console.log('refresh failed with error');
    }
  };
  useEffect(() => {
    (async () => {
      if (isAuthenticated && user && user.email && !user.profile && !gotProfile) {
        const token = await getAccessTokenSilently();
        try {
          setGotProfile(true);
          const profileResponse = await profileServiceClient.getProfile({
            token,
            email: user.email || '',
          });
          console.log(profileResponse);
          setUserInfo({
            token,
            profile: {
              email: user.email,
              username: profileResponse.username,
              firstName: profileResponse.firstName,
              lastName: profileResponse.lastName,
            },
            isAuthenticated: true,
            logout,
            refresh,
          });
        } catch (err) {
          console.log('getprofile failed with error: ', err);
          if (err.message.includes('404')) {
            setUserInfo({ ...userInfo, refresh });
            setShouldRegister(true);
          }
        }
      }
      if (!isLoading && !isAuthenticated) {
        await loginWithRedirect();
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
