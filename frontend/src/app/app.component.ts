import { Component } from '@angular/core';
import { ContactDto } from './services/dtos/contact.dto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  selectedContact?: ContactDto;

  onContactSelected(contact: ContactDto): void {
    this.selectedContact = contact;
  }
}
