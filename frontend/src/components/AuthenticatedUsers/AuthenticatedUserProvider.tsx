import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import ProfileServiceClient from '../../classes/ProfileServiceClient';
import AuthenticatedUserContext from '../../contexts/AuthenticatedUserContext';
import { AuthenticatedUser } from '../../CoveyTypes';

const profileServiceClient = new ProfileServiceClient();

const AuthenticatedUserProvider: React.FC = ({ children }) => {
  const [userInfo, setUserInfo] = useState<AuthenticatedUser | null>(null);
  const {
    user,
    loginWithRedirect,
    isAuthenticated,
    isLoading,
    logout,
    getAccessTokenSilently,
    handleRedirectCallback,
  } = useAuth0();
  console.log('USER: ', user);
  const [shouldRegister, setShouldRegister] = useState(false);
  useEffect(() => {
    (async () => {
      if (isAuthenticated && user && user.email && !userInfo) {
        const token = await getAccessTokenSilently();
        try {
          const profileResponse = await profileServiceClient.getProfile({
            token,
            email: user.email || '',
          });
          console.log(profileResponse);
          setUserInfo({
            token,
            email: user.email,
            username: profileResponse.username,
            firstName: profileResponse.firstName,
            lastName: profileResponse.lastName,
            isAuthenticated: true,
            logout,
          });
        } catch (err) {
          console.log('getprofile failed with error: ', err);
          setShouldRegister(true);
        }
      }
      if (!isLoading && !isAuthenticated) {
        // deploy netlify commit
        await loginWithRedirect({
          appState: { target: window.location.origin }
        });
        const appState = await handleRedirectCallback();
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
