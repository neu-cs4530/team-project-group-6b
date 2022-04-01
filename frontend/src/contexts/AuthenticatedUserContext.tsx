import React from 'react';
import { AuthenticatedUser } from '../CoveyTypes';

const Context = React.createContext<AuthenticatedUser | null>(null);

export default Context;
