export type Message = {
  id: number;
  msg: string;
  sender: 'me' | 'you';
  timestamp: number;
};
