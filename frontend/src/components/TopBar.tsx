import React, { useContext } from 'react';
import { Box, IconButton, Icon } from '@chakra-ui/react';
import { MdHome, MdOutlineLogout } from 'react-icons/md';
import { AppBar, Toolbar } from '@material-ui/core';
import { Link } from 'react-router-dom';
import AuthenticatedUserContext from '../contexts/AuthenticatedUserContext';
import useVideoContext from './VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';

function TopBar() {
  const authenticatedUserContext = useContext(AuthenticatedUserContext);
  const { room } = useVideoContext();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        {authenticatedUserContext && (
          <>
            <Toolbar>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <Link
                  to='/'
                  onClick={() => {
                    if (room) {
                      room.disconnect();
                    }
                  }}>
                  <div style={{ display: 'flex', gap: 15 }}>
                    <h1 style={{ fontSize: '1.5em', fontWeight: 'bold' }}>CoveyTown</h1>
                    <IconButton
                      aria-label='Home'
                      icon={<Icon as={MdHome} />}
                      variant='outline'
                      colorScheme='whiteAlpha'
                    />
                  </div>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <h6>Signed in as {authenticatedUserContext.profile?.username}</h6>
                  <IconButton
                    aria-label='logout'
                    icon={<Icon as={MdOutlineLogout} />}
                    variant='outline'
                    colorScheme='red'
                    onClick={() => authenticatedUserContext.logout()}>
                    Logout
                  </IconButton>
                </div>
              </div>
            </Toolbar>
          </>
        )}
      </AppBar>
    </Box>
  );
}

export default TopBar;
