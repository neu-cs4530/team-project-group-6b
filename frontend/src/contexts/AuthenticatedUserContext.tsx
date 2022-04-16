import React from 'react';
import { AuthenticatedUser } from '../CoveyTypes';

const Context = React.createContext<AuthenticatedUser>({
  isAuthenticated: false,
  token: '',
  logout: () => {},
  refresh: async () => {},
});

export default Context;
