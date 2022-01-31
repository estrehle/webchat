import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ReceiveInvitationReqDto } from './dtos/receive-invitation.req.dto';
import { ContactDto } from './dtos/contact.dto';
import { CreateInvitationResDto } from './dtos/create-invitation.res.dto';
import { GetContactsResDto } from './dtos/get-contacts.res.dto';
import { GetMessagesResDto } from './dtos/get-messages.res.dto';
import { GetMyInfoResDto } from './dtos/get-my-info.res.dto';
import { MessageDto } from './dtos/message.dto';
import { SendMessageReqDto } from './dtos/send-message.req.dto';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BackendService {
  constructor(private readonly http: HttpClient) {}

  createInvitation(): Observable<CreateInvitationResDto> {
    return this.http.post<CreateInvitationResDto>(this.url('/create-invitation'), {});
  }

  receiveInvitation(invitationCode: string): Observable<void> {
    const body: ReceiveInvitationReqDto = { invitationCode };
    return this.http.post<void>(this.url('/receive-invitation'), body);
  }

  getContacts(): Observable<ContactDto[]> {
    return this.http.get<GetContactsResDto>(this.url('/contacts'))
      .pipe(map(res => res.result));
  }

  getMessagesFor(connectionId: string): Observable<MessageDto[]> {
    return this.http.get<GetMessagesResDto>(this.url(`/messages/${connectionId}`))
      .pipe(map(res => res.result));
  }

  sendMessageTo(connectionId: string, msg: string): Observable<void> {
    const body: SendMessageReqDto = { msg };
    return this.http.post<void>(this.url(`/messages/${connectionId}`), body);
  }

  getMyInfo(): Observable<GetMyInfoResDto> {
    return this.http.get<GetMyInfoResDto>(this.url('/my-info'));
  }

  private url(path: string): string {
    // workaround to run multiple webchat agents on localhost
    // frontend port must be backend port + 1200,
    // e.g. frontend port = 4200 and backend port = 3000
    const port = Number(window.location.port) - (4200 - 3000);
    return `http://localhost:${port}/client${path}`;
  }
}
