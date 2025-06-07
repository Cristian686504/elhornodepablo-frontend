import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-mapa-direccion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'mapa-direccion.component.html' ,
  styleUrls: ['mapa-direccion.component.css']
})
export class MapAddressModalComponent implements AfterViewInit, OnInit {

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Output() dirSeleccionada = new EventEmitter<{dir: string, ubi: L.LatLng}>();
  @Output() modalClosed = new EventEmitter<void>();

  map: L.Map | null = null;
  marker: L.Marker | null = null;
  direcionSeleccionada = '';
  ubicacionSeleccionada: L.LatLng | null = null;
  cargando = false;
  errorValidacion = false;

  private searchTimeout: any;

  private uruguayBounds = L.latLngBounds(
    L.latLng(-35.00, -58.34),
    L.latLng(-30.06, -53.00)
  );

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
  }

  onDireccionInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const direccion = input.value.trim();

    if (this.errorValidacion) {
      this.errorValidacion = false;
    }

    clearTimeout(this.searchTimeout);

    if (direccion.length > 2) {
      this.searchTimeout = setTimeout(() => {
        this.incrementalGeocode(direccion);
      }, 1000);
    }
  }

  async incrementalGeocode(direccion: string) {
    this.cargando = true;

    try {
      const dirCompleta = `${direccion}, Uruguay`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dirCompleta)}&limit=5&countrycodes=UY`
      );

      if (!response.ok) {
        throw new Error('No se pudo obtener la ubicación');
      }

      const data = await response.json();

      if (data.length > 0) {
        const ubicacion = L.latLng(
          parseFloat(data[0].lat),
          parseFloat(data[0].lon)
        );

        if (this.uruguayBounds.contains(ubicacion)) {
          this.marker?.setLatLng(ubicacion);
          this.map?.setView(ubicacion, 15);
          this.ubicacionSeleccionada = ubicacion;
          this.direcionSeleccionada = data[0].display_name;
        }
      }
    } catch (error) {
      console.error('Error al geocodificar:', error);
    } finally {
      this.cargando = false;
    }
  }

  initMap() {
    if (this.mapContainer) {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [-32.3171, -58.0814],
        zoom: 14,
        minZoom: 6,
        maxBounds: this.uruguayBounds,
        maxBoundsViscosity: 1.0
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.marker = L.marker([-32.3171, -58.0814], {
        draggable: true
      }).addTo(this.map);

      this.marker.on('dragend', async (e) => {
        const nuevaUbicacion = e.target.getLatLng();
        if (this.uruguayBounds.contains(nuevaUbicacion)) {
          this.ubicacionSeleccionada = nuevaUbicacion;
          await this.actualizarDireccion(nuevaUbicacion);
        } else {
          this.marker?.setLatLng(this.ubicacionSeleccionada || [-34.9011, -56.1645]);
        }
      });

      this.map.on('click', async (e) => {
        if (this.uruguayBounds.contains(e.latlng)) {
          this.marker?.setLatLng(e.latlng);
          this.ubicacionSeleccionada = e.latlng;
          await this.actualizarDireccion(e.latlng);
        }
      });
    }
  }

  async actualizarDireccion(location: L.LatLng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&accept-language=es`
      );

      if (!response.ok) {
        throw new Error('No se pudo obtener la dirección');
      }

      const data = await response.json();
      let direccion = '';
      const direccionData = data.address; 

      if (direccionData.road) {
        direccion += direccionData.road;
      }

      if (direccionData.house_number) {
        direccion += ` ${direccionData.house_number}`;
      }

      if (direccionData.city || direccionData.town || direccionData.village) {
        direccion += `, ${direccionData.city || direccionData.town || direccionData.village}`;
      }

      this.direcionSeleccionada = direccion || 'Dirección no disponible';
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
      this.direcionSeleccionada = `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`;
    }
  }

  onClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }

  cerrarModal() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.modalClosed.emit();
  }

  validarYConfirmar() {
    this.errorValidacion = true;

    if (this.esUbicacionValida) {
      this.dirSeleccionada.emit({
        dir: this.direcionSeleccionada,
        ubi: this.ubicacionSeleccionada!
      });
      this.cerrarModal();
    }
  }

  get esUbicacionValida(): boolean {
    return !!this.ubicacionSeleccionada && 
           this.direcionSeleccionada !== "" && 
           this.direcionSeleccionada !== 'Dirección no disponible';
  }
}