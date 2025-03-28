import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-modal-persona-comercio',
  standalone: true,
  imports: [],
  templateUrl: './modal-persona-comercio.component.html',
  styleUrl: './modal-persona-comercio.component.css'
})
export class ModalPersonaComercioComponent implements AfterViewInit {

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() locationConfirmed = new EventEmitter<L.LatLng>();

  map: L.Map | null = null;
  selectedAddress = 'Seleccione una ubicación';
  selectedLocation: L.LatLng | null = null;

  // Límites de Uruguay (coordenadas del bounding box)
  private uruguayBounds = L.latLngBounds(
    L.latLng(-35.00, -58.34),  // Suroeste, cerca de la frontera con Argentina
    L.latLng(-30.06, -53.00)   // Noreste, cerca de la frontera con Brasil
  );

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    if (this.mapContainer) {
      // Centrar en Uruguay (Montevideo)
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [-34.9011, -56.1645],  // Coordenadas de Montevideo
        zoom: 7,
        minZoom: 6,  // Impedir que se aleje demasiado
        maxBounds: this.uruguayBounds,  // Limitar el movimiento del mapa
        maxBoundsViscosity: 1.0  // Efecto de "goma" al intentar salir de los límites
      });

      // Agregar capa de mapa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Agregar un marcador inicial en Montevideo
      const marker = L.marker([-34.9011, -56.1645], {
        draggable: true
      }).addTo(this.map);

      // Restricciones para el marcador
      marker.on('dragstart', () => {
        this.map?.setMaxBounds(this.uruguayBounds);
      });

      // Evento cuando el marcador se mueve
      marker.on('dragend', async (e) => {
        const newLocation = e.target.getLatLng();
        // Verificar si la nueva ubicación está dentro de Uruguay
        if (this.uruguayBounds.contains(newLocation)) {
          this.selectedLocation = newLocation;
          await this.updateAddress(newLocation);
        } else {
          // Si se intenta mover fuera, volver al último punto válido
          marker.setLatLng(this.selectedLocation || [-34.9011, -56.1645]);
        }
      });

      // Evento de clic en el mapa para mover el marcador
      this.map.on('click', async (e) => {
        // Verificar si la ubicación está dentro de Uruguay
        if (this.uruguayBounds.contains(e.latlng)) {
          marker.setLatLng(e.latlng);
          this.selectedLocation = e.latlng;
          await this.updateAddress(e.latlng);
        }
      });
    }
  }

  async updateAddress(location: L.LatLng) {
    try {
      // Usar la API de Nominatim para geocodificación inversa
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&accept-language=es`
      );
      
      if (!response.ok) {
        throw new Error('No se pudo obtener la dirección');
      }
      
      const data = await response.json();
      
      // Construir la dirección de manera más legible
      let address = '';
      const addressData = data.address;
      
      if (addressData.road) {
        address += addressData.road;
      }
      
      if (addressData.house_number) {
        address += ` ${addressData.house_number}`;
      }
      
      if (addressData.city || addressData.town || addressData.village) {
        address += `, ${addressData.city || addressData.town || addressData.village}`;
      }
      
      if (addressData.county) {
        address += `, ${addressData.county}`;
      }
      
      this.selectedAddress = address || 'Dirección no disponible';
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
      this.selectedAddress = `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`;
    }
  }

  closeModal() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.modalClosed.emit();
  }

  confirmLocation() {
    if (this.selectedLocation) {
      console.log('Ubicación confirmada:', this.selectedLocation);
      this.locationConfirmed.emit(this.selectedLocation);
      this.closeModal();
    }
  }
}

export default ModalPersonaComercioComponent;

