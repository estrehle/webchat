import {
  ConnectionInfo,
  InvitationCodeService,
} from './invitation-code.service';

describe('InvitationCodeService', () => {
  let invitationCodeService: InvitationCodeService;

  beforeEach(() => {
    invitationCodeService = new InvitationCodeService();
  });

  describe('encode', () => {
    it('should return non-empty string', async () => {
      const connInfo: ConnectionInfo = {
        connectionId: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
        myName: 'Example Name',
        myUrl: 'https://example.com/api',
      };

      const res = invitationCodeService.encode(connInfo);

      expect(typeof res).toEqual('string');
      expect(res.length).toBeGreaterThan(0);
    });
  });

  describe('decode', () => {
    it('should correctly decode ConnectionInfo object', async () => {
      const connInfo: ConnectionInfo = {
        connectionId: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
        myName: 'Example Name',
        myUrl: 'https://example.com/api',
      };
      // manually encode
      const code = Buffer.from(JSON.stringify(connInfo), 'binary').toString(
        'base64',
      );

      const res = invitationCodeService.decode(code);

      expect(res).toEqual(connInfo);
    });

    it('should throw on non-ASCII string', async () => {
      const notAscii = 'äöüß';

      expect(() => invitationCodeService.decode(notAscii)).toThrow();
    });

    it('should throw on missing connectionId', async () => {
      const incompleteConnInfo = {
        myName: 'Example Name',
        myUrl: 'https://example.com/api',
      } as ConnectionInfo;
      // manually encode
      const code = Buffer.from(
        JSON.stringify(incompleteConnInfo),
        'binary',
      ).toString('base64');

      expect(() => invitationCodeService.decode(code)).toThrow();
    });

    it('should throw on missing myName', async () => {
      const incompleteConnInfo = {
        connectionId: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
        myUrl: 'https://example.com/api',
      } as ConnectionInfo;
      // manually encode
      const code = Buffer.from(
        JSON.stringify(incompleteConnInfo),
        'binary',
      ).toString('base64');

      expect(() => invitationCodeService.decode(code)).toThrow();
    });

    it('should throw on missing myUrl', async () => {
      const incompleteConnInfo = {
        connectionId: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
        myName: 'Example Name',
      } as ConnectionInfo;
      // manually encode
      const code = Buffer.from(
        JSON.stringify(incompleteConnInfo),
        'binary',
      ).toString('base64');

      expect(() => invitationCodeService.decode(code)).toThrow();
    });
  });

  describe('encode -> decode', () => {
    it('decoding encoded ConnectionInfo object should return same object', async () => {
      const connInfo: ConnectionInfo = {
        connectionId: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
        myName: 'Example Name',
        myUrl: 'https://example.com/api',
      };

      const code = invitationCodeService.encode(connInfo);
      const decoded = invitationCodeService.decode(code);

      expect(decoded).toEqual(connInfo);
    });
  });
});
