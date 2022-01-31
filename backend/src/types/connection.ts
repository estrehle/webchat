import { Message } from './message';

export type UnclaimedConnection = {
  id: string;
  status: 'unclaimed';
};

export type UnconfirmedConnection = {
  id: string;
  status: 'unconfirmed';
  name: string;
  color: string;
  url: string;
};

export type ConfirmedConnection = {
  id: string;
  status: 'confirmed';
  name: string;
  color: string;
  url: string;
  messages: Message[];
};

export type Connection =
  | UnclaimedConnection
  | UnconfirmedConnection
  | ConfirmedConnection;
