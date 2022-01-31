import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BackendService } from 'src/app/services/backend.service';
import { CreateInvitationResDto } from 'src/app/services/dtos/create-invitation.res.dto';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
})
export class AddContactComponent implements OnInit {
  createdInvitationCode: string = '';
  receivedInvitationCode: string = '';

  constructor(
    private backend: BackendService,
    private dialogRef: MatDialogRef<AddContactComponent>,
  ) {}

  ngOnInit(): void {
    this.createInvitationCode();
  }

  addContact(): void {
    if (!this.receivedInvitationCode) {
      return;
    }

    this.backend.receiveInvitation(this.receivedInvitationCode).subscribe(
      () => this.dialogRef.close()
    );
  }

  close(): void {
    this.dialogRef.close();
  }

  createInvitationCode(): void {
    this.backend.createInvitation().subscribe(
      (res: CreateInvitationResDto) => this.createdInvitationCode = res.invitationCode
    );
  }
}
