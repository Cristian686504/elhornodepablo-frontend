import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../service/administradorService/administrador.service';
import { UsuarioService } from '../service/usuarioService/usuario.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-admin.component.html',
  styleUrl: './pedidos-admin.component.css'
})
export class PedidosAdminComponent {

  constructor(
    private administradorService: AdministradorService,
    private usuarioService: UsuarioService
  ) {}

secciones = [
    { id: 'usuarios', nombre: 'Usuarios' },
    { id: 'pedidos', nombre: 'Pedidos' },
    { id: 'fiestas', nombre: 'Fiestas' },
    { id: 'pizzas', nombre: 'Pizzas' },
    { id: 'ingredientes', nombre: 'Ingredientes' }
  ];

  listaAdministradores: any[] = [];
  listaUsuarios: any[] = [];
  listaIngredientes: any[] = [];
  listaPizzas: any[] = [];
  listaFiestas: any[] = [];
  listaPedidos: any[] = [];
  seccionActiva: string = 'usuarios';
  totalPaginas: number = 0;
  paginaActual: number = 0;
  tamañoPagina: number = 0;


  ngOnInit() {
    console.log('ngOnInit called');
      this.paginaActual = 0;
      this.tamañoPagina = 3;
  this.getPedidos(this.paginaActual, this.tamañoPagina);
  }

  seleccionarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }

  estadoFiltro: string = '';
pedidosFiltrados: any[] = [];

filtrarPedidos() {
  if (!this.estadoFiltro) {
    this.pedidosFiltrados = this.listaPedidos;
  } else {
    this.pedidosFiltrados = this.listaPedidos.filter(
      pedido => pedido.estado === this.estadoFiltro
    );
  }
}

    getPedidos(page: number, size: number) { 
  this.administradorService.getPedidos(page, size).subscribe(res => {
    console.log('Respuesta completa del backend:', res); // <-- Debug aquí

    if (Array.isArray(res.content)) {
      this.listaPedidos = res.content;
      this.totalPaginas = res.totalPages;
      this.paginaActual = res.number;
      this.filtrarPedidos(); 
    } else {
      this.listaPedidos = [];
      this.pedidosFiltrados = [];
      console.warn('La respuesta no tiene content como array:', res);
    }
  });
}



anteriorPaginaPedidos() {
  if (this.paginaActual > 0) {
    this.getPedidos(this.paginaActual - 1, this.tamañoPagina);
  }
}

siguientePaginaPedidos() {
  if (this.paginaActual < this.totalPaginas - 1) {
    this.getPedidos(this.paginaActual + 1, this.tamañoPagina);
  }
}

usuarioForm = {
    id: '',
    nombreUsuario: '',
    contrasenia: '',
    nombreCompleto: '',
    direccion: '',
    email: '',
    telefono: '',
    tipoCliente: '',
  };

  adminForm = {
    id: '',
    nombreUsuario: '',
    cedula: '',
    nombreCompleto: '',
    contrasenia: ''
  };

  ingredientesForm = {
  id: '',
  cantidad: '',
  nombre: '',
  unidad_medida: ''
 };

pizzasForm = {
  id: '',
  nombre: '',
  descripcion: '',
  precio: '',
  tipo: '',
  imagen: '',
  ingredientes: [] as { ingredienteId: number, ingrediente: { id: number, nombre: string, cantidad: number, unidad_medida: string }, cantidad: number }[]
};

fiestasForm = {
  id: '',
  hamburguesa: false,
  chivito: false,
  cantidadPersonas: '',
  fechaFiesta: '',  
  horaServir: '',   
  precio: '',
  pago: '',
  estado: '',
  direccion: '',
  cliente: { id: '', nombreUsuario: '', contrasenia: '',   nombreCompleto: '', direccion: '',email: '',telefono: '', tipoCliente: '', },
  pizzas: [] as Array<{ id: string;cantidad: string;pizza: {id: string; nombre: string; tipo: string; precio: string; descripcion: string; 
    ingredientes: Array<{id: string; cantidad: string; ingrediente: { id: string; nombre: string; cantidad: string; unidad_medida: string; }; }>;
    };
  }>,
};

pedidoForm = {
  id: '',
  fechaEntrega: '',
  entrega: false,
  metodoPago: '',
  estado: '',
  periodicidad: '',
  direccion: '',
  motivoBeneficio: '',
  agencia: '',
  fechaPedido: '',
  cliente: {
    id: '',
    nombreUsuario: '',
    contrasenia: '',
    nombreCompleto: ''
  },
  pizzas: [] as Array<{
    cantidad: number;
    pizza: {
      id: '';
      nombre: string;
      tipo: string;
      precio: number;
      ingredientes: Array<{
        id: number;
        nombre: string;
        cantidad: number;
        unidad_medida: string;
        gusto: boolean;
      }>
    }
  }>
};

aceptarPedido(id: number) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Deseas aceptar este pedido?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, aceptar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.administradorService.aceptarPedidoAdmin(id).subscribe({
        next: (response) => {
          Swal.fire(
            '¡Aceptado!',
            'El pedido ha sido aceptado correctamente.',
            'success'
          );
          this.getPedidos(this.paginaActual, this.tamañoPagina);
        },
        error: (error) => {
          Swal.fire(
            'Error',
            'Hubo un error al aceptar el pedido.',
            'error'
          );
        }
      });
    }
  });
}

cancelarPedido(id: number) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Deseas cancelar este pedido?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No'
  }).then((result) => {
    if (result.isConfirmed) {
      this.administradorService.cancelarPedidoAdmin(id).subscribe({
        next: (response) => {
          Swal.fire(
            '¡Cancelado!',
            'El pedido ha sido cancelado correctamente.',
            'success'
          );
          this.getPedidos(this.paginaActual, this.tamañoPagina);
        },
        error: (error) => {
          Swal.fire(
            'Error',
            'Hubo un error al cancelar el pedido.',
            'error'
          );
        }
      });
    }
  });
}
}