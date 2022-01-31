import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { ContactDto } from 'src/app/services/dtos/contact.dto';
import { GetMyInfoResDto } from 'src/app/services/dtos/get-my-info.res.dto';
import { MessageDto } from 'src/app/services/dtos/message.dto';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy {
  contact?: ContactDto;
  messages: MessageDto[] = [];
  myName: string = '';
  newMessage: string = '';
  private shouldScrollToBottom: boolean = false;
  private timer$?: Subscription;

  constructor(private backend: BackendService) {}

  @Input()
  set selectedContact(contact: ContactDto | undefined) {
    this.contact = contact;
    if (contact !== undefined) {
      this.getMessages();
    }
  }

  ngOnInit(): void {
    this.backend.getMyInfo().subscribe(
      (res: GetMyInfoResDto) => {
        this.myName = res.name;
      }
    );
    this.getMessages();

    this.timer$ = interval(100).subscribe(() => {
        this.getMessages();

        if (this.shouldScrollToBottom) {
          this.scrollToBottom();
        }
      });
  }

  ngOnDestroy(): void {
    this.timer$?.unsubscribe();
  }

  onNewMessageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && event.ctrlKey) {
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (this.contact && this.newMessage) {
      this.backend.sendMessageTo(this.contact.id, this.newMessage).subscribe(() => {
        this.newMessage = '';
      });
    }
  }

  private getMessages(): void {
    if (this.contact) {
      this.backend.getMessagesFor(this.contact.id).subscribe(
        (res: MessageDto[]) => {
          if (res.length !== this.messages.length) {
            this.messages = res;
            this.shouldScrollToBottom = true;
          }
        }
      );
    }
  }

  private scrollToBottom(): void {
    const messagesContainer = document.getElementById('messagesContainer');

    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    this.shouldScrollToBottom = false;
  }
}
