/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import {
  CreateInvitationResDto,
  GetContactsResDto,
  GetMessagesResDto,
  ReceiveInvitationReqDto,
  SendMessageReqDto as ClientSendMessageReqDto,
} from '@src/client-api/dtos';
import {
  SendConfirmationReqDto,
  SendMessageReqDto as ServerSendMessageReqDto,
} from '@src/server-api/dtos';
import {
  ConnectionInfo,
  InvitationCodeService,
} from '@src/services/invitation-code.service';
import { bootstrapMockServer, mockServerUrl } from './mock-server';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mockServer: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    mockServer = await bootstrapMockServer();
  });

  afterAll(async () => {
    await app.close();
    await mockServer.close();
  });

  it('use case 1: inviting another webchat user', async () => {
    /* here we are the inviter and the other webchat user is the invitee */

    // create invitation code
    const invitationRes = await request(app.getHttpServer())
      .post('/client/create-invitation')
      .expect(HttpStatus.CREATED);

    const invitationBody = invitationRes.body as CreateInvitationResDto;
    expect(typeof invitationBody.invitationCode).toEqual('string');
    expect(invitationBody.invitationCode.length).toBeGreaterThan(0);

    // mock decoding of invitation code, this is done by the invitee
    const invitationCodeService = new InvitationCodeService();
    const invitation = invitationCodeService.decode(
      invitationBody.invitationCode,
    );
    expect(invitation.myUrl).toEqual('http://localhost:3000');

    // receive confirmation from invitee
    const reqBody: SendConfirmationReqDto = {
      myName: 'another webchat user',
      myUrl: mockServerUrl,
    };
    await request(app.getHttpServer())
      .post(`/server/${invitation.connectionId}/confirm`)
      .send(reqBody)
      .expect(HttpStatus.OK);

    // verify that corresponding contact has been created and confirmed
    const contactRes = await request(app.getHttpServer())
      .get(`/client/contacts`)
      .expect(200);
    const contactBody: GetContactsResDto = contactRes.body;
    const contact = contactBody.result.find(
      (c) => c.id === invitation.connectionId,
    );
    expect(contact).toBeDefined();
    expect(contact!.name).toEqual(reqBody.myName);
  });

  const connectionId = 'f3f2a7e4-1e89-4c69-9017-1e9b2bc0d521';

  it('use case 2: being invited by another webchat user', async () => {
    /* here we are the invitee and the other webchat user is the inviter */

    const inviterUrl = mockServerUrl;

    // mock creation of invitation code, this is done by the inviter
    const invitation: ConnectionInfo = {
      connectionId,
      myName: 'another webchat user',
      myUrl: inviterUrl,
    };
    const invitationCodeService = new InvitationCodeService();
    const invitationCode = invitationCodeService.encode(invitation);

    // receive invitation
    const reqBody: ReceiveInvitationReqDto = { invitationCode };
    await request(app.getHttpServer())
      .post('/client/receive-invitation')
      .send(reqBody)
      .expect(HttpStatus.CREATED);

    // verify that corresponding contact has been created and confirmed
    const res = await request(app.getHttpServer())
      .get(`/client/contacts`)
      .expect(200);
    const body: GetContactsResDto = res.body;
    const contact = body.result.find((c) => c.id === connectionId);
    expect(contact).toBeDefined();
    expect(contact!.name).toEqual(invitation.myName);
  });

  it('use case 3: sending a message', async () => {
    /* sending to user from use case 2 */
    const msg = 'hello world';
    const sendMessageBody: ClientSendMessageReqDto = { msg };
    await request(app.getHttpServer())
      .post(`/client/messages/${connectionId}`)
      .send(sendMessageBody)
      .expect(201);

    // verify that message has been stored
    const res = await request(app.getHttpServer())
      .get(`/client/messages/${connectionId}`)
      .expect(200);
    const body: GetMessagesResDto = res.body;
    const lastMessage = body.result.pop();
    expect(lastMessage?.sender).toEqual('me');
    expect(lastMessage?.msg).toEqual(msg);
  });

  it('use case 4: receiving a message', async () => {
    /* receiving from user from use case 2 */
    const msg = 'hello world 2';
    const sendMessageBody: ServerSendMessageReqDto = { msg };
    await request(app.getHttpServer())
      .post(`/server/${connectionId}`)
      .send(sendMessageBody)
      .expect(200);

    // verify that message has been stored
    const res = await request(app.getHttpServer())
      .get(`/client/messages/${connectionId}`)
      .expect(200);
    const body: GetMessagesResDto = res.body;
    const lastMessage = body.result.pop();
    expect(lastMessage?.sender).toEqual('you');
    expect(lastMessage?.msg).toEqual(msg);
  });
});
