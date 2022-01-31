import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BackendService } from 'src/app/services/backend.service';
import { ContactDto } from 'src/app/services/dtos/contact.dto';
import { GetMyInfoResDto } from 'src/app/services/dtos/get-my-info.res.dto';
import { AddContactComponent } from '../add-contact/add-contact.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  @Output() contactSelected: EventEmitter<ContactDto> = new EventEmitter<ContactDto>();

  contacts: ContactDto[] = [];
  myName: string = '';

  constructor(
    private backend: BackendService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.backend.getMyInfo().subscribe(
      (res: GetMyInfoResDto) => this.myName = res.name
    );

    this.getContacts();
  }

  onAddContact(): void {
    const dialog = this.dialog.open(AddContactComponent, {
      autoFocus: false,
    });

    dialog.afterClosed().subscribe(
      () => this.getContacts()
    );
  }

  onContactSelected(contact: ContactDto): void {
    this.contactSelected.emit(contact);
  }

  private getContacts(): void {
    this.backend.getContacts().subscribe(
      (res: ContactDto[]) => this.contacts = res
    );
  }
}
