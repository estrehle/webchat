import {
  ConfirmedConnection,
  UnclaimedConnection,
  UnconfirmedConnection,
} from '@src/types/connection';
import { ConnectionRepo } from './connection.repo';

const connectionProps = {
  color: '#4e79a7',
  name: 'Example Name',
  url: 'https://example.com/api',
};

describe('ConnectionRepo', () => {
  let connectionRepo: ConnectionRepo;

  beforeEach(() => {
    connectionRepo = new ConnectionRepo();
  });

  describe('findAllConfirmed', () => {
    it('should find confirmed connection', async () => {
      const conn: ConfirmedConnection = {
        id: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
        status: 'confirmed',
        ...connectionProps,
        messages: [],
      };

      connectionRepo.add(conn);
      const res = connectionRepo.findAllConfirmed();

      expect(res).toEqual([conn]);
    });

    it('should exclude unclaimed connection', async () => {
      const conn: UnclaimedConnection = {
        id: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
        status: 'unclaimed',
      };

      connectionRepo.add(conn);
      const res = connectionRepo.findAllConfirmed();

      expect(res).toEqual([]);
    });

    it('should exclude unconfirmed connection', async () => {
      const conn: UnconfirmedConnection = {
        id: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
        status: 'unconfirmed',
        ...connectionProps,
      };

      connectionRepo.add(conn);
      const res = connectionRepo.findAllConfirmed();

      expect(res).toEqual([]);
    });

    it('should find confirmed connections among unconfirmed connections', async () => {
      const conn0: UnclaimedConnection = {
        id: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
        status: 'unclaimed',
      };
      const conn1: ConfirmedConnection = {
        id: 'b8c602e3-dd61-49bc-a5f1-0adfc406528c',
        status: 'confirmed',
        ...connectionProps,
        messages: [],
      };
      const conn2: UnconfirmedConnection = {
        id: 'a801a9a5-b866-421c-9e3d-4cb7154f32e7',
        status: 'unconfirmed',
        ...connectionProps,
      };
      const conn3: ConfirmedConnection = {
        id: '2a8996e3-eed2-4b58-931f-fcb6ff9c7d9c',
        status: 'confirmed',
        ...connectionProps,
        messages: [],
      };

      connectionRepo.add(conn0);
      connectionRepo.add(conn1);
      connectionRepo.add(conn2);
      connectionRepo.add(conn3);
      const res = connectionRepo.findAllConfirmed();

      expect(res.length).toEqual(2);
      expect(res).toContain(conn1);
      expect(res).toContain(conn3);
    });
  });
});
