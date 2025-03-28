import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import * as L from 'leaflet';
import { ModalPersonaComercioComponent } from '../modal-persona-comercio/modal-persona-comercio.component';

@Component({
  selector: 'app-tipo',
  standalone: true,
  imports: [CommonModule, ModalPersonaComercioComponent],
  templateUrl: './tipo.component.html',
  styleUrl: './tipo.component.css'
})
export class TipoComponent {
  isModalOpen = false;

  toggleText(event: Event) {
    const cardContent = (event.target as HTMLElement).closest('.card-content');
    const cardText = cardContent?.querySelector('.card-text');
    
    cardText?.classList.toggle('active');
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  handleLocationConfirmation(location: L.LatLng) {
    console.log('Location confirmed in parent component:', location);
    // Add any additional logic you want to perform when a location is confirmed
  }
}

export default TipoComponent;