import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../service/administradorService/administrador.service';
import { UsuarioService } from '../service/usuarioService/usuario.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-fiestas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fiestas-admin.component.html',
  styleUrl: './fiestas-admin.component.css'
})
export class FiestasAdminComponent implements OnInit{

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
  seccionActiva: string = 'usuarios';

  ngOnInit() {
    console.log('ngOnInit called');
    this.getFiestas();
  }

  seleccionarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }
  estadoFiltro: string = ''; 
  listaFiestasOriginales: any[] = []; 


  getFiestas() {
    this.administradorService.getFiestas().subscribe(res => {
      console.log('Fiestas recibidas:', res);
      if (Array.isArray(res.fiesta)) {
        this.listaFiestasOriginales = res.fiesta;
        this.listaFiestas = [...this.listaFiestasOriginales];
      } else {
        this.listaFiestas = [];
        console.warn('La propiedad Fiestas no es un array:', res.fiesta);
      }
    });
  }

 
  filtrarFiestas() {
    if (this.estadoFiltro) {
      this.listaFiestas = this.listaFiestasOriginales.filter(fiesta => fiesta.estado === this.estadoFiltro);
    } else {
      this.listaFiestas = [...this.listaFiestasOriginales]; 
    }
  }
    
  

  modalActivo = false;
  modoEdicion = false;
  tipoModal: 'cliente' | 'admin'  | 'ingrediente' | 'pizza' | 'fiesta' |null = null;

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


  paginaFiestas: number = 1; 
  fiestasPorPagina: number = 3;

  getFiestasPaginados() {
    const startIndex = (this.paginaFiestas - 1) * this.fiestasPorPagina;
    return this.listaFiestas.slice(startIndex, startIndex + this.fiestasPorPagina);
  }

  siguientePaginaFiestas() {
    if (this.paginaFiestas * this.fiestasPorPagina < this.listaFiestas.length) {
      this.paginaFiestas++;
    }
  }

  anteriorPaginaFiestas() {
    if (this.paginaFiestas > 1) {
      this.paginaFiestas--;
    }
  }


aceptarFiesta(fiesta: any) {
  const id = fiesta.id;
  const nombreUsuario = fiesta.cliente?.nombreUsuario;

  if (!nombreUsuario) {
    console.error('No se pudo obtener el nombre de usuario del cliente.');
    return;
  }

  this.administradorService.aceptarFiesta(id, nombreUsuario).subscribe({
    next: () => {
      this.getFiestas();

      Swal.fire({
        icon: 'success',
        title: 'Aceptada',
        text: 'La fiesta ha sido aceptada y los ingredientes descontados.',
        timer: 2000,
        showConfirmButton: false
      });
    },
    error: (err) => {
      console.error('Error al aceptar la fiesta:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo aceptar la fiesta.',
      });
    }
  });
}



cancelarFiesta(fiesta: any) {
  console.log('DEBUG: Fiesta recibida al cancelar:', fiesta);

  const id = fiesta.id;
  const nombreUsuario = fiesta.cliente?.nombreUsuario;

  if (!nombreUsuario) {
    console.error('No se pudo obtener el nombre de usuario del cliente.');
    return;
  }

  this.administradorService.cancelarFiesta(id, nombreUsuario).subscribe({
    next: () => {
      console.log(`Fiesta con ID ${id} cancelada exitosamente.`);
      this.getFiestas(); // recargar la lista

      Swal.fire({
        icon: 'success',
        title: 'Cancelada',
        text: 'La fiesta ha sido cancelada exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    error: (err) => {
      console.error('Error al cancelar la fiesta:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al cancelar la fiesta',
      });
    }
  });
}





}








