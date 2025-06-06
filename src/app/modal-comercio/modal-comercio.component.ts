import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ClienteService } from '../service/clienteService/cliente.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-comercio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-comercio.component.html',
  styleUrl: './modal-comercio.component.css'
})
export class ModalComercioComponent implements AfterViewInit, OnInit{

  
  
    @ViewChild('mapContainer') mapContainer!: ElementRef;
    @Output() modalClosed = new EventEmitter<void>();
  
    usuario = "";
    tipo = "COMERCIO";
    map: L.Map | null = null;
    marker: L.Marker | null = null;
    selectedAddress = 'Seleccione una ubicación';
    selectedLocation: L.LatLng | null = null;
    isLoading = false;

    showValidationErrors = false;

    // Temporizador para retraso de búsqueda
    private searchTimeout: any;

    // Límites de Uruguay (coordenadas del bounding box)
    private uruguayBounds = L.latLngBounds(
      L.latLng(-35.00, -58.34),  // Suroeste, cerca de la frontera con Argentina
      L.latLng(-30.06, -53.00)   // Noreste, cerca de la frontera con Brasil
    );
  
    constructor(private clienteService: ClienteService, private router: Router) {

    }
  
    ngOnInit() {

    }
  
    ngAfterViewInit() {
      this.initMap();
    }
  


  
  // Método para manejar cambios en el input
  onAddressInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const address = input.value.trim();

        // Resetear mensajes de validación
        if (this.showValidationErrors) {
          this.showValidationErrors = false;
        }
    
    // Limpiar temporizador anterior
    clearTimeout(this.searchTimeout);
    
    // Solo programar búsqueda si hay más de 2 caracteres
    if (address.length > 2) {
      // Establecer nuevo temporizador
      this.searchTimeout = setTimeout(() => {
        this.incrementalGeocode(address);
      }, 2000); // 2 segundos de retraso
    }
  }
  
  // Geocodificación incremental
  async incrementalGeocode(address: string) {
    // Activar estado de carga
    this.isLoading = true;
    
    try {
      // Agregar ", Uruguay" para mejorar precisión
      const fullAddress = `${address}, Uruguay`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=5&countrycodes=UY`
      );
      
      if (!response.ok) {
        throw new Error('No se pudo obtener la ubicación');
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
        // Tomar la primera ubicación
        const location = L.latLng(
          parseFloat(data[0].lat), 
          parseFloat(data[0].lon)
        );
        
        // Verificar si la ubicación está dentro de Uruguay
        if (this.uruguayBounds.contains(location)) {
          // Mover el marcador
          this.marker?.setLatLng(location);
          
          // Centrar el mapa en la nueva ubicación
          this.map?.setView(location, 12);
          
          // Actualizar la ubicación seleccionada
          this.selectedLocation = location;
          this.selectedAddress = data[0].display_name;
        }
      }
    } catch (error) {
      console.error('Error al geocodificar la dirección:', error);
    } finally {
      // Desactivar estado de carga
      this.isLoading = false;
    }
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
        this.marker = L.marker([-34.9011, -56.1645], {
          draggable: true
        }).addTo(this.map);
  
        // Restricciones para el marcador
        this.marker.on('dragstart', () => {
          this.map?.setMaxBounds(this.uruguayBounds);
        });
  
        // Evento cuando el marcador se mueve
        this.marker.on('dragend', async (e) => {
          const newLocation = e.target.getLatLng();
          // Verificar si la nueva ubicación está dentro de Uruguay
          if (this.uruguayBounds.contains(newLocation)) {
            this.selectedLocation = newLocation;
            await this.updateAddress(newLocation);
          } else {
            // Si se intenta mover fuera, volver al último punto válido
            this.marker?.setLatLng(this.selectedLocation || [-34.9011, -56.1645]);
          }
        });
  
        // Evento de clic en el mapa para mover el marcador
        this.map.on('click', async (e) => {
          // Verificar si la ubicación está dentro de Uruguay
          if (this.uruguayBounds.contains(e.latlng)) {
            this.marker?.setLatLng(e.latlng);
            this.selectedLocation = e.latlng;
            await this.updateAddress(e.latlng);
          }
        });
      }
    }
  
    async updateAddress(location: L.LatLng) {
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&accept-language=es`
        );
        
        if (!response.ok) {
          throw new Error('No se pudo obtener la dirección');
        }
        
        const data = await response.json();
        
        let address = '';
        const addressData = data.address;
        
        if (addressData.road) {
          address += addressData.road;
        }
        
        if (addressData.house_number) {
          address += ` ${addressData.house_number}`;
        
        
        if (addressData.city || addressData.town || addressData.village) {
          address += `, ${addressData.city || addressData.town || addressData.village}`;
        }
        
        if (addressData.county) {
          address += `, ${addressData.county}`;
        }
  
        if (addressData.state) {
          address += `, ${addressData.state}`;
        }
      } else {
        address = '';
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
  
    validateAndConfirm() {
      // Mostrar mensajes de validación
      this.showValidationErrors = true;
  
        // Verificar si todos los campos son válidos
        if (this.isValidLocation) {
        this.clienteService.currentUser.subscribe(user => {       
          this.usuario = user.nombreUsuario;
        });
        if (this.usuario) {
          this.clienteService.elegirTipoDireccion(this.usuario, this.tipo, this.selectedAddress);
          this.router.navigate(['/pedidos']);
        }
      }
    }

    get isValidLocation(): boolean {
      return !!this.selectedLocation && this.selectedAddress !== "" && this.selectedAddress !== 'Seleccione una ubicación' && 
             this.selectedAddress !== 'Dirección no disponible';
    }
    
  }

  
  export default ModalComercioComponent;

