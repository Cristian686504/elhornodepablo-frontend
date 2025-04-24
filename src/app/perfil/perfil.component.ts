import { Component } from '@angular/core';
import { ClienteService } from '../service/clienteService/cliente.service';
import { CommonModule } from '@angular/common';
import { ModalActualizarPerfilComponent } from "../modal-actualizar-perfil/modal-actualizar-perfil.component";
import { ModalDetallePedidoComponent } from "../modal-detalle-pedido/modal-detalle-pedido.component";
import { ModalDetalleFiestaComponent } from '../modal-detalle-fiesta/modal-detalle-fiesta.component';
import Swal from 'sweetalert2';

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
        console.log('Fiesta ID opoen modal:', this.fiestaSeleccionadaId);
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
        this.clienteService.actualizarPerfilCliente(dataActualizada).subscribe({
          next: () => {
            // Actualizar los datos locales
            this.email = dataActualizada.email;
            this.direccion = dataActualizada.direccion;
            this.telefono = dataActualizada.telefono;
      
            // Cerrar el modal
            this.closeModalActualizarPerfil();
      
            // Mostrar mensaje de éxito con SweetAlert
            Swal.fire({
              icon: 'success',
              title: 'Perfil actualizado',
              text: 'Tu perfil se ha actualizado correctamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#008f39'
            });
          },
          error: (error: unknown) => {
            console.error('Error al actualizar el perfil', error);
            
            // Mostrar mensaje de error con SweetAlert
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al actualizar tu perfil. Inténtalo nuevamente más tarde.',
              confirmButtonText: 'Cerrar',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
      

      cancelarPedido(id: number) {
        Swal.fire({
          title: '¿Está seguro?',
          text: '¿Desea cancelar este pedido?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#008f39',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, cancelarlo',
          cancelButtonText: 'No, mantenerlo'
        }).then((result) => {
          if (result.isConfirmed) {
            this.clienteService.cancelarPedido(this.nombreUsuario, id).subscribe((response) => {
              console.log('Pedido cancelado:', response);
              // Actualizar la lista de pedidos después de cancelar
              this.getPedidosCliente();
              Swal.fire(
                'Cancelado',
                'El pedido ha sido cancelado.',
                'success'
              );
            });
          }
        });
      }

      cancelarFiesta(id: number){
        if (confirm('¿Está seguro que desea cancelar esta fiesta?')) {
        this.clienteService.cancelarFiesta(this.nombreUsuario, id).subscribe((response) => {
          console.log('Fiesta cancelada:', response);
          // Actualizar la lista de fiestas después de cancelar
          this.getFiestasCliente();
        });
      }
    }
      cerrarSesion(){
        this.clienteService.logout();
      }
    
    }