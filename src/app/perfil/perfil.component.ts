import { Component } from '@angular/core';
import { ClienteService } from '../service/clienteService/cliente.service';
import { CommonModule } from '@angular/common';
import { ModalActualizarPerfilComponent } from "../modal-actualizar-perfil/modal-actualizar-perfil.component";
import { ModalDetallePedidoComponent } from "../modal-detalle-pedido/modal-detalle-pedido.component";
import { ModalDetalleFiestaComponent } from '../modal-detalle-fiesta/modal-detalle-fiesta.component';

interface datosActualizarPerfil{
  nombreUsuario: string;
  email: string;
  direccion: string;
  telefono: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ModalActualizarPerfilComponent, ModalDetallePedidoComponent, ModalDetalleFiestaComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})

export class PerfilComponent {

  nombreUsuario: string = '';
  email: string = '';
  direccion: string = '';
  telefono: string = '';
  tipoCliente: string = '';

  listaPedidosCliente: any[] = [];
  pedidoSeleccionadoId: number | null = null;
  listaFiestasCliente: any[] = [];
  fiestaSeleccionadaId: number | null = null;

  isModalActualizarPerfilOpen = false;
  isModalDetallesPedidoOpen = false;
  isModalDetallesFiestaOpen = false;


      constructor(private clienteService: ClienteService) {

      }

      ngOnInit() {
        // Obtener el usuario actual desde el BehaviorSubject
        this.clienteService.currentUser.subscribe(user => {
          if (user) {
            this.nombreUsuario = user.nombreUsuario;
            // Ahora obtener los datos del cliente
            this.getDatosCliente();
            this.getPedidosCliente();
            this.getFiestasCliente();
          }
        });
      }

      openModalActualizarPerfil() {
        this.isModalActualizarPerfilOpen = true;
      }

      closeModalActualizarPerfil() {
        this.isModalActualizarPerfilOpen = false;
      }

      openModalDetallesPedido(pedido: any){
        this.pedidoSeleccionadoId = pedido.id;
        this.isModalDetallesPedidoOpen = true;
      }

      closeModalDetallesPedido(){
        this.isModalDetallesPedidoOpen = false;
      }
    

      openModalDetallesFiesta(fiesta: any){
        this.fiestaSeleccionadaId = fiesta.id;
        console.log('Fiesta ID opoen modal:', this.fiestaSeleccionadaId); // Debugging line
        this.isModalDetallesFiestaOpen = true;
      }

      closeModalDetallesFiesta(){
        this.isModalDetallesFiestaOpen = false;
      }

      getDatosCliente() {
        // Ya que el método original no devuelve un Observable, tenemos que modificar cómo lo usamos
        this.clienteService.getDatosCliente(this.nombreUsuario).subscribe((datos) => {
        this.email = datos.email;
        console.log(datos.email);
        this.direccion = datos.direccion;
        console.log(datos.direccion);
        this.telefono = datos.telefono;
        console.log(datos.telefono);
        this.tipoCliente = datos.tipoCliente;
        console.log(datos.tipoCliente);
        }
        );
      }

      getPedidosCliente() {
        this.clienteService.getPedidosCliente(this.nombreUsuario).subscribe((pedidos) => {
          this.listaPedidosCliente = Array.isArray(pedidos) ? pedidos : [];
        });
      }

      getFiestasCliente() {
        this.clienteService.getFiestasCliente(this.nombreUsuario).subscribe((fiestas) => {
          this.listaFiestasCliente = Array.isArray(fiestas) ? fiestas : [];
        console.log(this.listaFiestasCliente);
        });
      }

      actualizarPerfil(dataActualizada: datosActualizarPerfil) {
        // Actualizar los datos del cliente
        this.clienteService.actualizarPerfilCliente(dataActualizada).subscribe({
          next: () => {
            // Actualizar los datos locales
            this.email = dataActualizada.email;
            this.direccion = dataActualizada.direccion;
            this.telefono = dataActualizada.telefono;
            
            // Cerrar el modal
            this.closeModalActualizarPerfil();
            
            // Opcional: Mostrar mensaje de éxito
            console.log('Perfil actualizado correctamente');
          },
          error: (error: unknown) => {
            console.error('Error al actualizar el perfil', error);
          }
      });
      }

      cerrarSesion(){
        this.clienteService.logout();
      }
    
    }