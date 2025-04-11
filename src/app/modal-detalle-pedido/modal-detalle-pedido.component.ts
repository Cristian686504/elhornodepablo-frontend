import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ClienteService } from '../service/clienteService/cliente.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-detalle-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalle-pedido.component.html',
  styleUrl: './modal-detalle-pedido.component.css'
})
export class ModalDetallePedidoComponent implements OnChanges{
  
  @Input() isOpen: boolean = false;
  @Input() pedidoId: number | null = null;
  @Output() close = new EventEmitter<void>();
  
  nombreUsuario: string = '';
  agencia: string = '';
  direccion: string = '';
  entrega: boolean = false;
  fechaEntrega: string = '';
  fechaPedido: string = '';
  metodoPago: string = '';
  periodicidad: string = '';
  precioTotal: string = '';
  pizzas: any[] = [];
  loading: boolean = false;
  error: string | null = null;


  constructor(private clienteService: ClienteService) {

  }

  ngOnInit() {
    // Obtener el usuario actual desde el BehaviorSubject
    this.clienteService.currentUser.subscribe(user => {
      if (user) {
        this.nombreUsuario = user.nombreUsuario;
        if (this.pedidoId) {
          this.cargarDetallesPedido();
        }
      }
    });
  }


  ngOnChanges(changes: SimpleChanges) {
    // Detectar cambios en el pedidoId para recargar los datos
    if (changes['pedidoId'] && !changes['pedidoId'].firstChange && this.pedidoId) {
      this.cargarDetallesPedido();
    }
  }

  cargarDetallesPedido() {
    if (!this.pedidoId) return;
    
    this.loading = true;
    this.error = null;
    

    this.clienteService.detallesPedido(this.nombreUsuario, this.pedidoId).subscribe({
      next: (detallesPedido) => {
        if (detallesPedido) {
  
          this.agencia = detallesPedido.agencia;
          this.direccion = detallesPedido.direccion;
          this.entrega = detallesPedido.entrega;
          this.fechaEntrega = detallesPedido.fechaEntrega;
          this.fechaPedido = detallesPedido.fechaPedido;
          this.metodoPago = detallesPedido.metodoPago;
          this.periodicidad = detallesPedido.periodicidad;
          this.precioTotal = detallesPedido.precioTotal;
          this.pizzas = detallesPedido.pizzas || [];
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