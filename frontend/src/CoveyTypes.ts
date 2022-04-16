import { Socket } from 'socket.io-client';
import { UserLocation } from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';

export type VideoRoom = {
  twilioID: string;
  id: string;
};
export type UserProfile = {
  displayName: string;
  id: string;
};
export type CoveyAppState = {
  sessionToken: string;
  userName: string;
  currentTownFriendlyName: string;
  currentTownID: string;
  currentTownIsPubliclyListed: boolean;
  myPlayerID: string;
  emitMovement: (location: UserLocation) => void;
  socket: Socket | null;
  apiClient: TownsServiceClient;
};

export type AuthenticatedUser = {
  token: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  pronouns: string;
  occupation: string;
  bio: string;
  isAuthenticated: boolean;
  logout: () => void;
};
export interface IUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  pronouns: string;
  occupation: string;
  bio: string;
}
