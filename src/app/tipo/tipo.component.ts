import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalPersonaComponent } from '../modal-persona/modal-persona.component';
import { ModalComercioComponent } from "../modal-comercio/modal-comercio.component";

@Component({
  selector: 'app-tipo',
  standalone: true,
  imports: [CommonModule, ModalPersonaComponent, ModalComercioComponent],
  templateUrl: './tipo.component.html',
  styleUrl: './tipo.component.css'
})
export class TipoComponent {
  isModalPersonaOpen = false;
  isModalComercioOpen = false;
  isModalBeneficioOpen = false;
  isModalExteriorOpen = false;

  toggleText(event: Event) {
    const cardContent = (event.target as HTMLElement).closest('.card-content');
    const cardText = cardContent?.querySelector('.card-text');
    
    cardText?.classList.toggle('active');
  }

  openModalPersona() {
    this.isModalPersonaOpen = true;
  }

  openModalComercio() {
    this.isModalComercioOpen = true;
  }

  closeModalPersona() {
    this.isModalPersonaOpen = false;
  }

  closeModalComercio() {
    this.isModalComercioOpen = false;
  }

}

export default TipoComponent;