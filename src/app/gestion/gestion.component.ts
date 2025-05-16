import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../service/administradorService/administrador.service';
import { UsuarioService } from '../service/usuarioService/usuario.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})
export class GestionComponent implements OnInit {

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
  seccionActiva: string = 'usuarios';

  ngOnInit() {
    console.log('ngOnInit called');
    this.getAdministradores();
    this.getClientes();
  }

  seleccionarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }

  getAdministradores() {
    this.administradorService.getAdministradores().subscribe(res => {
      console.log('Datos recibidos:', res);
      this.listaAdministradores = Array.isArray(res.administradores) ? res.administradores : [];
    });
  }

  getClientes() {
    this.usuarioService.getClientes().subscribe(res => {
      console.log('Clientes recibidos:', res);
      this.listaUsuarios = Array.isArray(res.clientes) ? res.clientes : [];
    });
  }

  modalActivo = false;
  modoEdicion = false;
  tipoModal: 'cliente' | 'admin' | null = null;

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

  abrirModal(tipo: 'cliente' | 'admin', datos?: any) {
    this.modalActivo = true;
    this.tipoModal = tipo;
    this.modoEdicion = !!datos;

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
    } else if (tipo === 'admin') {
      this.adminForm = datos ? { ...datos } : {
        id: '',
        nombreUsuario: '',
        cedula: '',
        nombreCompleto: '',
        contrasenia: ''  
      };
    }
  }

  cerrarModal() {
    this.modalActivo = false;
    this.tipoModal = null;
    this.modoEdicion = false;
  }

  guardarUsuarioCliente() {
    if (this.modoEdicion) {
      console.log('Modificar cliente:', this.usuarioForm);
      // Aquí iría la lógica de edición
    } else {
      console.log('Crear cliente:', this.usuarioForm);
      
      // Llamar al servicio para crear un nuevo usuario
      this.usuarioService.CrearUsuario(this.usuarioForm).subscribe({
        next: (res) => {
          console.log('Usuario creado:', res);
          this.getClientes(); 
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al crear el usuario:', err);
          alert('Error al crear el usuario. Verificá los datos.');
        }
      });
    }
    this.cerrarModal(); // Cerrar el modal después de la operación
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
        },
        error: (err) => {
          console.error('Error al actualizar administrador:', err);
          alert('Error al modificar el administrador. Verificá los datos.');
        }
      });
      
    } else {
      console.log('Crear admin:', this.adminForm);
  
      this.administradorService.crearAdministrador(this.adminForm).subscribe({
        next: (res) => {
          console.log('Administrador creado:', res);
          this.getAdministradores(); // Recargar la lista
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al crear administrador:', err);
          alert('Error al crear el administrador. Verificá los datos.');
        }
      });
    }
  }
  

  usuarioSeleccionado: any = null;
  administradorSeleccionado: any = null;

  seleccionarFila(item: any, tipo: 'cliente' | 'admin') {
    if (tipo === 'cliente') {
      this.usuarioSeleccionado = item;
    } else if (tipo === 'admin') {
      this.administradorSeleccionado = item;
    }
  }

  // Paginación
  paginaUsuarios: number = 1;
  paginaAdministradores: number = 1;
  usuariosPorPagina: number = 10;
  administradoresPorPagina: number = 10;

  // Métodos para paginación
  getUsuariosPaginados() {
    const startIndex = (this.paginaUsuarios - 1) * this.usuariosPorPagina;
    return this.listaUsuarios.slice(startIndex, startIndex + this.usuariosPorPagina);
  }

  getAdministradoresPaginados() {
    const startIndex = (this.paginaAdministradores - 1) * this.administradoresPorPagina;
    return this.listaAdministradores.slice(startIndex, startIndex + this.administradoresPorPagina);
  }

  siguientePaginaUsuarios() {
    if (this.paginaUsuarios * this.usuariosPorPagina < this.listaUsuarios.length) {
      this.paginaUsuarios++;
    }
  }

  anteriorPaginaUsuarios() {
    if (this.paginaUsuarios > 1) {
      this.paginaUsuarios--;
    }
  }

  siguientePaginaAdministradores() {
    if (this.paginaAdministradores * this.administradoresPorPagina < this.listaAdministradores.length) {
      this.paginaAdministradores++;
    }
  }

  anteriorPaginaAdministradores() {
    if (this.paginaAdministradores > 1) {
      this.paginaAdministradores--;
    }
  }

  eliminarAdmin(admin: any) {
    if (!admin) return;
  
    if (confirm(`¿Estás seguro de que querés eliminar al administrador con ID ${admin.id}?`)) {
      this.administradorService.eliminarAdministrador(admin.id).subscribe({
        next: () => {
          console.log('Administrador eliminado');
          this.getAdministradores(); 
          alert('Administrador eliminado con éxito.');
        },
        error: (err) => console.error('Error al eliminar administrador:', err)
      });
    }
  }

  eliminarCliente(cliente: any) {
    if (!cliente) return;
  
    if (confirm(`¿Estás seguro de que querés eliminar al cliente con ID ${cliente.id}?`)) {
      this.usuarioService.eliminarCliente(cliente.id).subscribe({
        next: () => {
          console.log('Cliente eliminado');
          this.getClientes(); 
          alert('Cliente eliminado con éxito.');
        },
        error: (err) => {
          console.error('Error al eliminar cliente:', err);
          alert('Ocurrió un error al eliminar el cliente.');
        }
      });
    }
  }
  
  
  
  
}
