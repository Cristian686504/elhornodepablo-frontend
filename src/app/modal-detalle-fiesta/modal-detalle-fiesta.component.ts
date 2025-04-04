import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ClienteService } from '../service/clienteService/cliente.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-detalle-fiesta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalle-fiesta.component.html',
  styleUrl: './modal-detalle-fiesta.component.css'
})
export class ModalDetalleFiestaComponent implements OnChanges{

  @Input() isOpen: boolean = false;
  @Input() fiestaId: number | null = null;
  @Output() close = new EventEmitter<void>();

  nombreUsuario: string = '';
  cantidadPersonas: string = '';
  fechaFiesta: string = '';
  horaServir: string = '';
  metodoPago: string = '';
  chivito: string = '';
  hamburguesa: string = '';
  precio: string = '';
  direccion: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(private clienteService: ClienteService) {

  }

  ngOnInit() {
    // Obtener el usuario actual desde el BehaviorSubject
    this.clienteService.currentUser.subscribe(user => {
      if (user) {
        this.nombreUsuario = user.nombreUsuario;
        console.log('Fiesta ID:', this.fiestaId); // Debugging line
        if (this.fiestaId) {
          this.cargarDetallesFiesta();
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Detectar cambios en el fiestaId para recargar los datos
    if (changes['fiestaId'] && !changes['fiestaId'].firstChange && this.fiestaId) {
      this.cargarDetallesFiesta();
    }
  }

  cargarDetallesFiesta() {
    if (!this.fiestaId) return;
    
    this.loading = true;
    this.error = null;
    

    this.clienteService.detallesFiesta(this.nombreUsuario, this.fiestaId).subscribe({
      next: (detallesFiesta) => {
        if (detallesFiesta) {
          console.log('Detalles de fiesta IF:', detallesFiesta); // Debugging line
          const detalle = detallesFiesta;
          this.cantidadPersonas = detalle.cantidadPersonas;
          this.fechaFiesta = detalle.fechaFiesta;
          this.horaServir = detalle.horaServir;
          this.metodoPago = detalle.metodoPago;
          this.chivito = detalle.chivito;
          this.hamburguesa = detalle.hamburguesa;
          this.precio = detalle.precio;
          this.direccion = detalle.direccion;
        } else {
          this.error = "No se encontraron detalles para este pedido";
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles del pedido', err);
        this.error = "Error al cargar los detalles del pedido";
        this.loading = false;
      }
    });
  }

  cerrarModal() {
    this.close.emit();
  }

}
