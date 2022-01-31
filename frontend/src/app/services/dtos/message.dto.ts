export interface MessageDto {
  id: number;
  msg: string;
  timestamp: number;
  sender: 'me' | 'you';
}
