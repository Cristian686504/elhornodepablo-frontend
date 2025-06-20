import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../service/administradorService/administrador.service';
import { UsuarioService } from '../service/usuarioService/usuario.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})
export class GestionComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapContainer!: ElementRef;
  @ViewChild('mapPedido') mapPedidoContainer!: ElementRef;
  @ViewChild('mapFiesta') mapFiestaContainer!: ElementRef;
  private map: L.Map | null = null;
  private mapPedido: L.Map | null = null;
  private mapFiesta: L.Map | null = null;
  private marker: L.Marker | null = null;
  private markerPedido: L.Marker | null = null;
  private markerFiesta: L.Marker | null = null;

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

  // Variables de paginación para fiestas
  paginaFiestas: number = 0;
  fiestasPorPagina: number = 10;
  totalPaginasFiestas: number = 0;

  // Variables de paginación para pedidos
  paginaPedidos: number = 0;
  pedidosPorPagina: number = 10;
  totalPaginasPedidos: number = 0;

  // Propiedades de paginación
  paginaAdministradores = 0;
  administradoresPorPagina = 10;
  totalPaginasAdministradores = 0;

  // Propiedades de paginación para clientes
  paginaUsuarios: number = 0;
  usuariosPorPagina: number = 10;
  totalPaginasUsuarios: number = 0;

  ngOnInit() {
    console.log('ngOnInit called');
    this.getAdministradores();
    this.getUsuarios();
    this.getIngredientes();
    this.getPizzas();
    // Inicialización de variables de paginación
    this.paginaFiestas = 0;
    this.fiestasPorPagina = 10;
    this.totalPaginasFiestas = 0;
    this.paginaPedidos = 0;
    this.pedidosPorPagina = 10;
    this.totalPaginasPedidos = 0;
    this.getFiestas();
    this.getPedidos(this.paginaPedidos, this.pedidosPorPagina);
  }

  ngAfterViewInit() {
    // No inicializamos el mapa aquí, lo haremos cuando se abra el modal
  }

  private initMap() {
    if (this.map) return;

    setTimeout(() => {
      if (this.mapContainer && this.mapContainer.nativeElement) {
        this.map = L.map(this.mapContainer.nativeElement).setView([-34.9205, -56.1666], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          this.updateMarker(lat, lng);
          this.getAddressFromCoordinates(lat, lng);
        });
      }
    }, 100);
  }

  private initMapPedido() {
    if (this.mapPedido) return;

    setTimeout(() => {
      if (this.mapPedidoContainer && this.mapPedidoContainer.nativeElement) {
        this.mapPedido = L.map(this.mapPedidoContainer.nativeElement).setView([-34.9205, -56.1666], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.mapPedido);

        this.mapPedido.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          this.updateMarkerPedido(lat, lng);
          this.getAddressFromCoordinatesPedido(lat, lng);
        });
      }
    }, 100);
  }

  private initMapFiesta() {
    if (this.mapFiesta) return;

    setTimeout(() => {
      if (this.mapFiestaContainer && this.mapFiestaContainer.nativeElement) {
        this.mapFiesta = L.map(this.mapFiestaContainer.nativeElement).setView([-34.9205, -56.1666], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.mapFiesta);

        this.mapFiesta.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          this.updateMarkerFiesta(lat, lng);
          this.getAddressFromCoordinatesFiesta(lat, lng);
        });
      }
    }, 100);
  }

  private updateMarker(lat: number, lng: number) {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map!);
    }
  }

  private updateMarkerPedido(lat: number, lng: number) {
    if (this.markerPedido) {
      this.markerPedido.setLatLng([lat, lng]);
    } else {
      this.markerPedido = L.marker([lat, lng]).addTo(this.mapPedido!);
    }
  }

  private updateMarkerFiesta(lat: number, lng: number) {
    if (this.markerFiesta) {
      this.markerFiesta.setLatLng([lat, lng]);
    } else {
      this.markerFiesta = L.marker([lat, lng]).addTo(this.mapFiesta!);
    }
  }

  private async getAddressFromCoordinates(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        this.usuarioForm.direccion = data.display_name;
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
    }
  }

  private async getAddressFromCoordinatesPedido(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        this.pedidoForm.direccion = data.display_name;
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
    }
  }

  private async getAddressFromCoordinatesFiesta(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        this.fiestasForm.direccion = data.display_name;
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
    }
  }

  seleccionarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }

  getAdministradores() {
    this.administradorService.getAdministradoresPaginados(this.paginaAdministradores, this.administradoresPorPagina).subscribe({
      next: (response) => {
        this.listaAdministradores = response.content;
        this.totalPaginasAdministradores = response.totalPages;
      },
      error: (error) => {
        console.error('Error al obtener administradores:', error);
      }
    });
  }

  getUsuarios() {
    this.usuarioService.getClientesPaginados(this.paginaUsuarios, this.usuariosPorPagina).subscribe({
      next: (response) => {
        
        this.listaUsuarios = response.content;
        this.totalPaginasUsuarios = response.totalPages;
      
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        console.error('Detalles del error:', error.message);
      }
    });
  }

    getIngredientes() {
      this.administradorService.getIngredientes().subscribe(res => {
        console.log('Ingredientes recibidos:', res);
        if (Array.isArray(res.ingrediente)) {
          this.listaIngredientes = res.ingrediente;
        } else {
          this.listaIngredientes = [];
          console.warn('La propiedad ingrediente no es un array:', res.ingrediente);
        }
      });
    }

    getPizzas() {
      this.administradorService.getPizzas().subscribe(res => {
        console.log('Pizzas recibidas:', res);
        if (Array.isArray(res.pizza)) {
          this.listaPizzas = res.pizza;
        } else {
          this.listaPizzas = [];
          console.warn('La propiedad pizza no es un array:', res.pizza);
        }
      });
    }
    
    getFiestas() {
      console.log('Obteniendo fiestas - Página:', this.paginaFiestas, 'Tamaño:', this.fiestasPorPagina);
      this.administradorService.getFiestasPaginadas(this.paginaFiestas, this.fiestasPorPagina).subscribe({
        next: (res) => {

          
          if (res && Array.isArray(res.content)) {
            this.listaFiestas = res.content;
            this.totalPaginasFiestas = res.totalPages || 1;
            this.paginaFiestas = res.number || 0;

          } else {
            this.listaFiestas = [];
            console.warn('La respuesta no tiene la estructura esperada:', res);
          }
        },
        error: (error) => {
          console.error('Error al obtener fiestas:', error);
          this.listaFiestas = [];
        }
      });
    }

    getPedidos(page: number, size: number) {
      this.administradorService.getPedidos(page, size).subscribe(res => {
        console.log('Pedidos recibidos:', res);
        if (res && Array.isArray(res.content)) {
          this.listaPedidos = res.content;
          this.totalPaginasPedidos = res.totalPages || 1;
          this.paginaPedidos = res.number || 0;
          console.log('Total páginas pedidos:', this.totalPaginasPedidos);
          console.log('Página actual pedidos:', this.paginaPedidos);
        } else {
          this.listaPedidos = [];
          this.totalPaginasPedidos = 1;
          this.paginaPedidos = 0;
          console.warn('La respuesta no tiene content como array:', res);
        }
      });
    }

    anteriorPaginaPedidos() {
      if (this.paginaPedidos > 0) {
        this.getPedidos(this.paginaPedidos - 1, this.pedidosPorPagina);
      }
    }

    siguientePaginaPedidos() {
      if (this.paginaPedidos < this.totalPaginasPedidos - 1) {
        this.getPedidos(this.paginaPedidos + 1, this.pedidosPorPagina);
      }
    }






    
  

  modalActivo = false;
  modoEdicion = false;
  tipoModal: 'cliente' | 'admin'  | 'ingrediente' | 'pizza' | 'fiesta' | 'pedido' |null = null;

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
  precio: '',
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




abrirModal(tipo: 'cliente' | 'admin' | 'ingrediente' | 'pizza' | 'fiesta' | 'pedido', datos?: any) {
  this.modalActivo = true;
  this.tipoModal = tipo;
  this.modoEdicion = !!datos;
  

  console.log('Datos recibidos:', datos);


  if (tipo === 'cliente') {
    this.usuarioForm = datos ? { ...datos } : {
      id: '',
      nombreUsuario: '',
      contrasenia: '',
      nombreCompleto: '',
      direccion: '',
      email: '',
      telefono: '',
      tipoCliente: '',
    };
    
    setTimeout(() => {
      this.initMap();
    }, 100);
  } else if (tipo === 'admin') {
    this.adminForm = datos ? { ...datos } : {
      id: '',
      nombreUsuario: '',
      cedula: '',
      nombreCompleto: '',
      contrasenia: ''
    };
  } else if (tipo === 'ingrediente') {
    this.ingredientesForm = datos ? { ...datos } : {
      id: '',
      cantidad: '',
      nombre: '',
      unidad_medida: ''
    };
  } else if (tipo === 'pizza') {
  console.log('Ingredientes recibidos:', datos?.ingredientes);

  this.pizzasForm = datos ? { ...datos } : {
    id: '',
    nombre: '',
    descripcion: '',
    precio: '',
    tipo: '',
    imagen: '',
    ingredientes: []
  };

  if (this.modoEdicion && this.pizzasForm.imagen && !this.pizzasForm.imagen.startsWith('data:image')) {
    this.pizzasForm.imagen = 'data:image/png;base64,' + this.pizzasForm.imagen;
  }
}else if (tipo === 'fiesta') {
    this.fiestasForm = datos
      ? { ...datos }
      : {
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
          cliente: {
            id: '',
            nombreUsuario: '',
            contrasenia: '',
            nombreCompleto: '',
            direccion: '',
            email: '',
            telefono: '',
            tipoCliente: '',
          },
          pizzas: []
        };

    setTimeout(() => {
      this.initMapFiesta();
    }, 100);
  }else if (tipo === 'pedido') {
    this.pedidoForm = datos ? {
      id: datos.id,
      fechaEntrega: datos.fechaEntrega,
      entrega: datos.entrega,
      metodoPago: datos.metodoPago,
      estado: datos.estado,
      periodicidad: datos.periodicidad,
      direccion: datos.direccion,
      motivoBeneficio: datos.motivoBeneficio,
      agencia: datos.agencia,
      precio: datos.precio,
      fechaPedido: datos.fechaPedido,
      cliente: datos.cliente ? {
        id: datos.cliente.id || '',
        nombreUsuario: datos.cliente.nombreUsuario || '',
        contrasenia: '', 
        nombreCompleto: datos.cliente.nombreCompleto || ''
      } : {
        id: '',
        nombreUsuario: '',
        contrasenia: '',
        nombreCompleto: '',
      },
      pizzas: datos.pizzas ? datos.pizzas.map((p: any) => ({
        cantidad: p.cantidad || 1,
        pizza: {
          id: p.pizza.id,
          nombre: p.pizza.nombre,
          tipo: p.pizza.tipo,
          precio: p.pizza.precio,
          descripcion: p.pizza.descripcion || '',
          ingredientes: p.pizza.ingredientes || []
        }
      })) : []
    } : {
      id: '',
      fechaEntrega: '',
      entrega: false,
      metodoPago: '',
      estado: 'PENDIENTE',
      periodicidad: '',
      direccion: '',
      precio: '',
      motivoBeneficio: '',
      agencia: '',
      fechaPedido: new Date().toISOString().split('T')[0],
      cliente: {
        id: '',
        nombreUsuario: '',
        contrasenia: '',
        nombreCompleto: '',
      },
      pizzas: []
    };

    setTimeout(() => {
      this.initMapPedido();
    }, 100);
  }


}



  cerrarModal() {
    this.modalActivo = false;
    this.tipoModal = null;
    this.modoEdicion = false;
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
    if (this.mapPedido) {
      this.mapPedido.remove();
      this.mapPedido = null;
      this.markerPedido = null;
    }
    if (this.mapFiesta) {
      this.mapFiesta.remove();
      this.mapFiesta = null;
      this.markerFiesta = null;
    }
  }

  validarUsuario(): boolean {
    const errores = [];

    if (!this.usuarioForm.nombreUsuario) {
      errores.push('El nombre de usuario es requerido');
    } else if (this.usuarioForm.nombreUsuario.length < 3) {
      errores.push('El nombre de usuario debe tener al menos 3 caracteres');
    }

    if (!this.usuarioForm.nombreCompleto) {
      errores.push('El nombre completo es requerido');
    }

    if (!this.usuarioForm.direccion) {
      errores.push('La dirección es requerida');
    }

    if (!this.usuarioForm.email) {
      errores.push('El email es requerido');
    } else if (!this.validarEmail(this.usuarioForm.email)) {
      errores.push('El email debe tener un formato válido');
    }

    if (!this.usuarioForm.telefono) {
      errores.push('El teléfono es requerido');
    } else if (!this.validarTelefono(this.usuarioForm.telefono)) {
      errores.push('El teléfono debe contener al menos 8 dígitos numéricos');
    }

    if (!this.usuarioForm.tipoCliente) {
      errores.push('El tipo de cliente es requerido');
    }

    if (!this.modoEdicion && !this.usuarioForm.contrasenia) {
      errores.push('La contraseña es requerida');
    }

    if (errores.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        html: errores.join('<br>')
      });
      return false;
    }

    return true;
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  validarTelefono(telefono: string): boolean {
    const regex = /^[0-9]{8,}$/;
    return regex.test(telefono);
  }

  guardarUsuarioCliente() {
    if (!this.validarUsuario()) {
      return;
    }

    if (this.modoEdicion) {
      const id = +this.usuarioForm.id;
      const datosCliente: any = {
        id,
        nombreUsuario: this.usuarioForm.nombreUsuario,
        nombreCompleto: this.usuarioForm.nombreCompleto,
        direccion: this.usuarioForm.direccion,
        email: this.usuarioForm.email,
        telefono: this.usuarioForm.telefono,
        tipoCliente: this.usuarioForm.tipoCliente
      };

      // Solo agregar contraseña si se modificó
      if (this.usuarioForm.contrasenia) {
        datosCliente.contrasenia = this.usuarioForm.contrasenia;
      }

      this.usuarioService.actualizarCliente(id, datosCliente).subscribe({
        next: () => {
          console.log('Cliente actualizado:', datosCliente);
          this.getUsuarios();
          this.cerrarModal();
          Swal.fire({
            icon: 'success',
            title: 'Cliente modificado',
            text: 'El cliente ha sido actualizado exitosamente.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: err => {
          console.error('Error al modificar cliente:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al modificar el cliente. Verificá los datos.',
          });
        }
      });
    } else {
      console.log('Crear cliente:', this.usuarioForm);
      this.usuarioService.CrearUsuario(this.usuarioForm).subscribe({
        next: (res) => {
          console.log('Usuario creado:', res);
          this.getUsuarios();
          this.cerrarModal();
          Swal.fire({
            icon: 'success',
            title: 'Usuario creado',
            text: 'El usuario ha sido creado exitosamente.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error al crear el usuario:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al crear el usuario. Verificá los datos.',
          });
        }
      });
    }
  }


  guardarUsuarioAdministrador() {
  if (this.modoEdicion) {
    const adminActual = this.adminForm;
    const datos = {
      id: +adminActual.id,
      nombreUsuario: adminActual.nombreUsuario,
      cedula: adminActual.cedula,
      nombreCompleto: adminActual.nombreCompleto,
      contrasenia: adminActual.contrasenia,
    };

    this.administradorService.actualizarAdministrador(datos.id, datos).subscribe({
      next: (res) => {
        console.log('Administrador actualizado:', res);
        this.getAdministradores();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Administrador modificado con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al actualizar administrador:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al modificar el administrador. Verificá los datos.'
        });
      }
    });

  } else {
    console.log('Crear admin:', this.adminForm);

    this.administradorService.crearAdministrador(this.adminForm).subscribe({
      next: (res) => {
        console.log('Administrador creado:', res);
        this.getAdministradores();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Administrador creado con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al crear administrador:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al crear el administrador. Verificá los datos.'
        });
      }
    });
  }
}

  

  guardarIngrediente() {
  const ingrediente = {
    id: +this.ingredientesForm.id,
    nombre: this.ingredientesForm.nombre,
    cantidad: this.ingredientesForm.cantidad,
    unidad_medida: this.ingredientesForm.unidad_medida
  };

  console.log("Ingrediente a guardar:", ingrediente);

  if (this.modoEdicion) {
    this.administradorService.actualizarIngrediente(ingrediente.id, ingrediente).subscribe({
      next: () => {
        console.log('Ingrediente actualizado');
        this.getIngredientes();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Ingrediente actualizado con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al actualizar ingrediente:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al modificar el ingrediente.'
        });
      }
    });
  } else {
    this.administradorService.crearIngrediente(ingrediente).subscribe({
      next: () => {
        console.log('Ingrediente creado');
        this.getIngredientes();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Ingrediente creado con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al crear ingrediente:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al crear el ingrediente.'
        });
      }
    });
  }
}


  agregarIngrediente() {
    if (!Array.isArray(this.pizzasForm.ingredientes)) {
      this.pizzasForm.ingredientes = [];
    }

    this.pizzasForm.ingredientes.push({
      ingredienteId: 0,  
      ingrediente: { id: 0, nombre: '', cantidad: 0, unidad_medida: '' },  
      cantidad: 1  
    });
  }
  
  
  quitarIngrediente(index: number) {
    this.pizzasForm.ingredientes.splice(index, 1);
  }

  guardarPizza() {
  if (this.pizzasForm.imagen) {
    this.pizzasForm.imagen = this.pizzasForm.imagen.split(',')[1]; 
  }

  const pizza = {
    id: +this.pizzasForm.id,
    nombre: this.pizzasForm.nombre,
    tipo: this.pizzasForm.tipo,
    precio: this.pizzasForm.precio,
    descripcion: this.pizzasForm.descripcion,
    imagen: this.pizzasForm.imagen,
    ingredientes: this.pizzasForm.ingredientes.map(i => ({
      cantidad: i.cantidad,
      ingrediente: {
        id: i.ingredienteId || (i.ingrediente && i.ingrediente.id)
      }
    }))
  };

  console.log("Imagen codificada:", this.pizzasForm.imagen);
  console.log("JSON que se va a enviar:", JSON.stringify(pizza));
  console.log("Pizza a guardar:", pizza);

  if (this.modoEdicion) {
    this.administradorService.actualizarPizza(pizza.id, pizza).subscribe({
      next: () => {
        console.log('Pizza actualizada');
        this.getPizzas();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'Pizza actualizada con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al actualizar pizza:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al modificar la pizza. Verificá los datos.'
        });
      }
    });
  } else {
    this.administradorService.crearPizza(pizza).subscribe({
      next: () => {
        console.log('Pizza creada');
        this.getPizzas();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Creación exitosa',
          text: 'Pizza creada con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al crear pizza:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al crear la pizza. Verificá los datos.'
        });
      }
    });
  }
}


guardarFiesta() {
  const fiesta = {
    id: +this.fiestasForm.id,
    cantidadPersonas: this.fiestasForm.cantidadPersonas,
    fechaFiesta: this.fiestasForm.fechaFiesta,
    horaServir: this.fiestasForm.fechaFiesta + 'T' + this.fiestasForm.horaServir, // unir fecha y hora
    precio: this.fiestasForm.precio,
    pago: this.fiestasForm.pago,
    estado: this.fiestasForm.estado,
    direccion: this.fiestasForm.direccion,
    chivito: !!this.fiestasForm.chivito,
    hamburguesa: !!this.fiestasForm.hamburguesa,
    cliente: {
      id: +this.fiestasForm.cliente.id
    },
    pizzas: this.fiestasForm.pizzas.map(p => ({
      cantidad: p.cantidad,
      pizza: { id: +p.pizza.id }
    }))
  };

  console.log("JSON que se va a enviar:", JSON.stringify(fiesta, null, 2));

  if (this.modoEdicion) {
    this.administradorService.actualizarFiesta(fiesta.id, fiesta).subscribe({
      next: () => {
        console.log('Fiesta actualizada');
        this.getFiestas();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Fiesta modificada',
          text: 'Fiesta modificada con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al actualizar fiesta:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al modificar la fiesta. Verificá los datos.'
        });
      }
    });
  } else {
    this.administradorService.crearFiesta(fiesta).subscribe({
      next: () => {
        console.log('Fiesta creada');
        this.getFiestas();
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Fiesta creada',
          text: 'Fiesta creada con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al crear fiesta:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al crear la fiesta. Verificá los datos.'
        });
      }
    });
  }
}


  
  

  usuarioSeleccionado: any = null;
  administradorSeleccionado: any = null;
  ingredienteSeleccionado: any = null;
  pizzaSeleccionada: any = null;
  fiestaSeleccionada: any = null;
  pedidoSeleccionado: any = null;

  seleccionarFila(item: any, tipo: 'cliente' | 'admin' | 'ingrediente'| 'pizza' | 'fiesta' | 'pedido') {
    if (tipo === 'cliente') {
      this.usuarioSeleccionado = item;
    } else if (tipo === 'admin') {
      this.administradorSeleccionado = item;
    }else if (tipo === 'ingrediente'){
      this.ingredienteSeleccionado = item;
    } else if (tipo === 'pizza') {
      this.pizzaSeleccionada = item;
    } else if (tipo === 'fiesta') {
      this.fiestaSeleccionada = item;
    }else if (tipo === 'pedido') {
      this.pedidoSeleccionado = item;
    }
  
    
  }

  paginaIngredientes: number = 1;
  ingredientesPorPagina: number = 10;
  
  paginaPizzas: number = 1;
  pizzasPorPagina: number = 10;

  // Métodos para paginación
  getUsuariosPaginados() {
    const startIndex = (this.paginaUsuarios - 1) * this.usuariosPorPagina;
    return this.listaUsuarios.slice(startIndex, startIndex + this.usuariosPorPagina);
  }

  getAdministradoresPaginados() {
    return this.listaAdministradores;
  }

  siguientePaginaUsuarios() {
    if (this.paginaUsuarios < this.totalPaginasUsuarios - 1) {
      this.paginaUsuarios++;
      this.getUsuarios();
    }
  }

  anteriorPaginaUsuarios() {
    if (this.paginaUsuarios > 0) {
      this.paginaUsuarios--;
      this.getUsuarios();
    }
  }

  siguientePaginaAdministradores() {
    if (this.paginaAdministradores < this.totalPaginasAdministradores - 1) {
      this.paginaAdministradores++;
      this.getAdministradores();
    }
  }

  anteriorPaginaAdministradores() {
    if (this.paginaAdministradores > 0) {
      this.paginaAdministradores--;
      this.getAdministradores();
    }
  }


  // Métodos para paginar ingrdientes
  getIngredientesPaginados() {
    console.log("Lista completa de ingredientes:", this.listaIngredientes);
    const startIndex = (this.paginaIngredientes - 1) * this.ingredientesPorPagina;
    const endIndex = startIndex + this.ingredientesPorPagina; 
    return this.listaIngredientes.slice(startIndex, endIndex);
  }
  

  siguientePaginaIngredientes() {
    if (this.paginaIngredientes * this.ingredientesPorPagina < this.listaIngredientes.length) {
      this.paginaIngredientes++;
    }
  }
  
  anteriorPaginaIngredientes() {
    if (this.paginaIngredientes > 1) {
      this.paginaIngredientes--;
    }
  }
  
  // Métodos para paginar pizzas
  getPizzasPaginadas() {
    const startIndex = (this.paginaPizzas - 1) * this.pizzasPorPagina;
    return this.listaPizzas.slice(startIndex, startIndex + this.pizzasPorPagina);
  }
  
  siguientePaginaPizzas() {
    if (this.paginaPizzas * this.pizzasPorPagina < this.listaPizzas.length) {
      this.paginaPizzas++;
    }
  }
  
  anteriorPaginaPizzas() {
    if (this.paginaPizzas > 1) {
      this.paginaPizzas--;
    }
  }







  // Métodos para paginar fiestas
  getFiestasPaginados() {
    return this.listaFiestas;
  }

  anteriorPaginaFiestas() {
    if (this.paginaFiestas > 0) {
      this.paginaFiestas--;
      this.getFiestas();
    }
  }

  siguientePaginaFiestas() {
    if (this.paginaFiestas < this.totalPaginasFiestas - 1) {
      this.paginaFiestas++;
      this.getFiestas();
    }
  }


  eliminarAdmin(admin: any) {
  if (!admin) return;

  Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Querés eliminar al administrador "${admin.nombreUsuario}"? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.administradorService.eliminarAdministrador(admin.id).subscribe({
        next: () => {
          console.log('Administrador eliminado');
          this.getAdministradores();
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'Administrador eliminado con éxito.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error al eliminar administrador:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar el administrador.'
          });
        }
      });
    }
  });
}


  eliminarCliente(cliente: any) {
  if (!cliente) return;

  Swal.fire({
    title: `¿Estás seguro?`,
    text: `¿Querés eliminar al cliente "${cliente.nombreUsuario}"? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.usuarioService.eliminarCliente(cliente.id).subscribe({
        next: () => {
          console.log('Cliente eliminado');
          this.getUsuarios(); 
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'Cliente eliminado con éxito.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error al eliminar cliente:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar el cliente.'
          });
        }
      });
    }
  });
}

  
 eliminarIngrediente(ingrediente: any) {
  if (!ingrediente) return;

  Swal.fire({
    title: `¿Estás seguro?`,
    text: `¿Querés eliminar el ingrediente "${ingrediente.nombre}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.administradorService.eliminarIngrediente(ingrediente.id).subscribe({
        next: () => {
          console.log('Ingrediente eliminado');
          this.getIngredientes();
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'Ingrediente eliminado con éxito.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error al eliminar ingrediente:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar el ingrediente.'
          });
        }
      });
    }
  });
}


eliminarPizza(pizza: any) {
  if (!pizza) return;

  Swal.fire({
    title: `¿Estás seguro de que deseas eliminar la pizza "${pizza.nombre}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      this.administradorService.eliminarPizza(pizza.id).subscribe({
        next: () => {
          console.log('Pizza eliminada');
          this.getPizzas();
          Swal.fire({
            icon: 'success',
            title: 'Pizza eliminada',
            text: 'Pizza eliminada con éxito.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error al eliminar la pizza:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar la pizza.'
          });
        }
      });
    }
  });
}

eliminarFiesta(fiesta: any) {
  if (!fiesta) return;

  Swal.fire({
    title: `¿Estás seguro de que deseas eliminar la fiesta "${fiesta.id}"?`,
    icon: 'warning',
    showCancelButton: true,
     confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.administradorService.eliminarFiesta(fiesta.id).subscribe({
        next: () => {
          console.log('Fiesta eliminada');
          this.getFiestas();
          Swal.fire({
            icon: 'success',
            title: 'Eliminada',
            text: 'Fiesta eliminada con éxito.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error al eliminar la fiesta:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar la fiesta.'
          });
        }
      });
    }
  });
}

  

  mostrarModal: boolean = false; 

   obtenerPizzas() {
    this.administradorService.getPizzas().subscribe((response: any) => {
      this.listaPizzas = response.pizza;
    });
  }

  abrirModalIngredientes(pizza: any) {
    this.pizzaSeleccionada = pizza; 
    this.mostrarModal = true; 
  }

  // Método para cerrar el modal
  cerrarModalP() {
    this.mostrarModal = false; 
  }

  getIngredienteNombre(ingredienteId: number): string {
    const ingrediente = this.listaIngredientes.find(item => item.id === ingredienteId);
    return ingrediente ? ingrediente.nombre : 'Ingrediente no encontrado';
  }
  


agregarPizzaAFiesta() {
  if (!Array.isArray(this.fiestasForm.pizzas)) {
    this.fiestasForm.pizzas = [];
  }

  this.fiestasForm.pizzas.push({
    id: Date.now().toString(), 
    cantidad: "1", 
    pizza: {
      id: "",       
      nombre: "",  
      tipo: "",
      precio: "",
      descripcion: "",
      ingredientes: []
    }
  });
}

// Método para quitar pizza de la lista
quitarPizza(index: number) {
  if (this.tipoModal === 'pedido' && this.pedidoForm.pizzas) {
    this.pedidoForm.pizzas.splice(index, 1);
    // Forzar la detección de cambios
    this.pedidoForm = { ...this.pedidoForm };
  } else if (this.tipoModal === 'fiesta' && this.fiestasForm.pizzas) {
    this.fiestasForm.pizzas.splice(index, 1);
    // Forzar la detección de cambios
    this.fiestasForm = { ...this.fiestasForm };
  }
}

procesarImagen(event: any) {
  const archivo = event.target.files[0];
  if (archivo) {
    const lector = new FileReader();
    lector.readAsDataURL(archivo);
    lector.onload = () => {
      this.pizzasForm.imagen = lector.result as string; 
      console.log('Imagen procesada:', this.pizzasForm.imagen);
      
    };
  }
}
  


agregarPizzaAPedido() {
  if (!this.pedidoForm.pizzas) {
    this.pedidoForm.pizzas = [];
  }

  this.pedidoForm.pizzas.push({
    cantidad: 1, // o 0 si preferís
    pizza: {
      id: '',
      nombre: '',
      tipo: '',
      precio: 0,
      ingredientes: []
    }
  });
}


onPizzaSeleccionada(event: Event, index: number) {
  const selectElement = event.target as HTMLSelectElement;  // casteo explícito
  const pizzaIdStr = selectElement.value;
  const pizzaId = Number(pizzaIdStr);
  const pizzaSeleccionada = this.listaPizzas.find(p => p.id === pizzaId);
  if (pizzaSeleccionada) {
    this.pedidoForm.pizzas[index].pizza = { ...pizzaSeleccionada };
  }
}



guardarPedido() {
  const pedido = {
    id: +this.pedidoForm.id,
    fechaEntrega: this.pedidoForm.fechaEntrega,
    entrega: this.pedidoForm.entrega,
    metodoPago: this.pedidoForm.metodoPago,
    estado: this.pedidoForm.estado,
    periodicidad: this.pedidoForm.periodicidad,
    direccion: this.pedidoForm.direccion,
    motivoBeneficio: this.pedidoForm.motivoBeneficio,
    agencia: this.pedidoForm.agencia,
    fechaPedido: this.pedidoForm.fechaPedido,
    cliente: {
      id: +this.pedidoForm.cliente.id
    },
    precio: this.pedidoForm.precio,
    pizzas: this.pedidoForm.pizzas.map(p => ({
      cantidad: p.cantidad,
      pizza: { id: +p.pizza.id }
    }))
  };
console.log('ID actual del pedidoForm:', this.pedidoForm.id);

  console.log("JSON que se va a enviar:", JSON.stringify(pedido, null, 2));

  if (this.modoEdicion) {
    this.administradorService.modificarPedido(pedido.id, pedido).subscribe({
      next: () => {
        console.log('Pedido actualizado');
        this.getPedidos(this.paginaPedidos, this.pedidosPorPagina);
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Pedido modificado',
          text: 'Pedido modificado con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al actualizar pedido:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al modificar el pedido. Verificá los datos.'
        });
      }
    });
  } else {
    this.administradorService.crearPedidoAdmin(pedido).subscribe({
      next: () => {
        console.log('Pedido creado');
        this.getPedidos(this.paginaPedidos, this.pedidosPorPagina);
        this.cerrarModal();
        Swal.fire({
          icon: 'success',
          title: 'Pedido creado',
          text: 'Pedido creado con éxito.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al crear pedido:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al crear el pedido. Verificá los datos.'
        });
      }
    });
  }
}


eliminarPedido() {
  if (this.pedidoSeleccionado) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.administradorService.eliminarPedido(this.pedidoSeleccionado.id).subscribe({
          next: () => {
            Swal.fire(
              '¡Eliminado!',
              'El pedido ha sido eliminado.',
              'success'
            );
            this.getPedidos(this.paginaPedidos, this.pedidosPorPagina);
            this.pedidoSeleccionado = null;
          },
          error: (error) => {
            console.error('Error al eliminar pedido:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar el pedido.',
              'error'
            );
          }
        });
      }
    });
  }
}

}
