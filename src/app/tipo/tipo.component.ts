import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import * as L from 'leaflet';
import { ModalPersonaComponent } from '../modal-persona/modal-persona.component';

@Component({
  selector: 'app-tipo',
  standalone: true,
  imports: [CommonModule, ModalPersonaComponent],
  templateUrl: './tipo.component.html',
  styleUrl: './tipo.component.css'
})
export class TipoComponent {
  isModalPersonaOpen = false;

  toggleText(event: Event) {
    const cardContent = (event.target as HTMLElement).closest('.card-content');
    const cardText = cardContent?.querySelector('.card-text');
    
    cardText?.classList.toggle('active');
  }

  openModalPersona() {
    this.isModalPersonaOpen = true;
  }

  closeModalPersona() {
    this.isModalPersonaOpen = false;
  }

}

export default TipoComponent;