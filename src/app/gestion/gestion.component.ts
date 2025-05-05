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
  listaIngredientes: any[] = [];
  listaPizzas: any[] = [];
  seccionActiva: string = 'usuarios';

  ngOnInit() {
    console.log('ngOnInit called');
    this.getAdministradores();
    this.getClientes();
    this.getIngredientes();
    this.getPizzas();
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

    getIngredientes() {
      this.administradorService.getIngredientes().subscribe(res => {
        console.log('Ingredientes recibidos:', res);
        // Accede a la propiedad 'ingrediente' que es un array
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
    
    
  

  modalActivo = false;
  modoEdicion = false;
  tipoModal: 'cliente' | 'admin'  | 'ingrediente' | 'pizza' | null = null;

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
  ingredientes: [] as { ingredienteId: number, ingrediente: { id: number, nombre: string, cantidad: number, unidad_medida: string }, cantidad: number }[]
};

abrirModal(tipo: 'cliente' | 'admin' | 'ingrediente' | 'pizza', datos?: any) {
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
      ingredientes: []
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
      const id = +this.usuarioForm.id;     
      const datosCliente = {
        id,
        nombreUsuario: this.usuarioForm.nombreUsuario,
        contrasenia:     this.usuarioForm.contrasenia,
        nombreCompleto:  this.usuarioForm.nombreCompleto,
        direccion:       this.usuarioForm.direccion,
        email:           this.usuarioForm.email,
        telefono:        this.usuarioForm.telefono,
        tipoCliente:     this.usuarioForm.tipoCliente
      };
  
      this.usuarioService.actualizarCliente(id, datosCliente).subscribe({
        next: () => {
          console.log('Cliente actualizado:', datosCliente);
          this.getClientes();    
          this.cerrarModal();    
          alert('Cliente modificado con éxito.');
        },
        error: err => {
          console.error('Error al modificar cliente:', err);
          alert('Error al modificar el cliente. Verificá los datos.');
        }
      });
    } else {
      console.log('Crear cliente:', this.usuarioForm);
    
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
    this.cerrarModal(); 
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
          this.getAdministradores();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al crear administrador:', err);
          alert('Error al crear el administrador. Verificá los datos.');
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
          alert('Ingrediente actualizado con éxito.');
        },
        error: (err) => {
          console.error('Error al actualizar ingrediente:', err);
          alert('Error al modificar el ingrediente.');
        }
      });
    } else {
      this.administradorService.crearIngrediente(ingrediente).subscribe({
        next: () => {
          console.log('Ingrediente creado');
          this.getIngredientes();
          this.cerrarModal();
          alert('Ingrediente creado con éxito.');
        },
        error: (err) => {
          console.error('Error al crear ingrediente:', err);
          alert('Error al crear el ingrediente.');
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
    const pizza = {
      id: +this.pizzasForm.id,
      nombre: this.pizzasForm.nombre,
      tipo: this.pizzasForm.tipo,
      precio: this.pizzasForm.precio,
      descripcion: this.pizzasForm.descripcion,
      ingredientes: this.pizzasForm.ingredientes.map(i => ({
        cantidad: i.cantidad,  
        ingrediente: {
          id: i.ingredienteId 
        }
      }))
    };

    console.log("JSON que se va a enviar:", JSON.stringify(pizza));
    console.log("Pizza a guardar:", pizza);
  
    if (this.modoEdicion) {
 
      this.administradorService.actualizarPizza(pizza.id, pizza).subscribe({
        next: () => {
          console.log('Pizza actualizada');
          this.getPizzas();  
          this.cerrarModal(); 
          alert('Pizza actualizada con éxito.');
        },
        error: (err) => {
          console.error('Error al actualizar pizza:', err);
          alert('Error al modificar la pizza. Verificá los datos.');
        }
      });
    } else {
 
      this.administradorService.crearPizza(pizza).subscribe({
        next: () => {
          console.log('Pizza creada');
          this.getPizzas();  
          this.cerrarModal(); 
          alert('Pizza creada con éxito.');
        },
        error: (err) => {
          console.error('Error al crear pizza:', err);
          alert('Error al crear la pizza. Verificá los datos.');
        }
      });
    }
  }
  
  

  usuarioSeleccionado: any = null;
  administradorSeleccionado: any = null;
  ingredienteSeleccionado: any = null;
  pizzaSeleccionada: any = null;

  seleccionarFila(item: any, tipo: 'cliente' | 'admin' | 'ingrediente'| 'pizza') {
    if (tipo === 'cliente') {
      this.usuarioSeleccionado = item;
    } else if (tipo === 'admin') {
      this.administradorSeleccionado = item;
    }else if (tipo === 'ingrediente'){
      this.ingredienteSeleccionado = item;
    }    else if (tipo === 'pizza') {
      this.pizzaSeleccionada = item;
    }
    
  }

  // Paginación
  paginaUsuarios: number = 1;
  paginaAdministradores: number = 1;

  usuariosPorPagina: number = 10;
  administradoresPorPagina: number = 10;

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
  
    if (confirm(`¿Estás seguro de que querés eliminar al cliente con ID ${cliente.nombre}?`)) {
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
  
 eliminarIngrediente(ingrediente: any) {
    if (!ingrediente) return;
  
    if (confirm(`¿Estás seguro de que querés eliminar el ingrediente "${ingrediente.nombre}"?`)) {
      this.administradorService.eliminarIngrediente(ingrediente.id).subscribe({
        next: () => {
          console.log('Ingrediente eliminado');
          this.getIngredientes();
          alert('Ingrediente eliminado con éxito.');
        },
        error: (err) => {
          console.error('Error al eliminar ingrediente:', err);
          alert('Ocurrió un error al eliminar el ingrediente.');
        }
      });
    }
  }

  eliminarPizza(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta pizza?')) {
      this.administradorService.eliminarPizza(id).subscribe({
        next: (res) => {
          console.log('Pizza eliminada:', res);
          this.getPizzas();
          alert('Pizza eliminada con éxito.');
        },
        error: (err) => {
          console.error('Error al eliminar la pizza:', err);
          alert('Error al eliminar la pizza.');
        }
      });
    }
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
    this.mostrarModal = false; // Ocultar el modal
  }

  getIngredienteNombre(ingredienteId: number): string {
    const ingrediente = this.listaIngredientes.find(item => item.id === ingredienteId);
    return ingrediente ? ingrediente.nombre : 'Ingrediente no encontrado';
  }
  
  
  
  
}
