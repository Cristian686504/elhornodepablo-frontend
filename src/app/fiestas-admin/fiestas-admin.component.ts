import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../service/administradorService/administrador.service';
import { UsuarioService } from '../service/usuarioService/usuario.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-fiestas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fiestas-admin.component.html',
  styleUrl: './fiestas-admin.component.css',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.95)' }),
          stagger('100ms', [
            animate('350ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 0, transform: 'scale(0.95)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class FiestasAdminComponent implements OnInit {

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
  totalPaginas: number = 0;
  paginaActual: number = 0;
  tamañoPagina: number = 0;
  estadoFiltro: string = 'ACEPTADO';
  fiestasFiltradas: any[] = [];
  fiestasPaginadas: any[] = [];
  cargando: boolean = false;

  ngOnInit() {
    console.log('ngOnInit called');
    this.paginaActual = 0;
    this.tamañoPagina = 3;
    this.getFiestas(this.paginaActual, this.tamañoPagina);
  }

  seleccionarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }

  filtrarFiestas() {
    if (!this.estadoFiltro) {
      this.fiestasFiltradas = this.listaFiestas;
    } else if (this.estadoFiltro === 'FINALIZADA') {
      this.fiestasFiltradas = this.listaFiestas.filter(
        fiesta => fiesta.estado === 'FINALIZADA' || fiesta.estado === 'FINALIZADO'
      );
    } else {
      this.fiestasFiltradas = this.listaFiestas.filter(
        fiesta => fiesta.estado === this.estadoFiltro
      );
    }
    // Recalcular total de páginas basado en las fiestas filtradas
    this.totalPaginas = Math.ceil(this.fiestasFiltradas.length / this.tamañoPagina);
    // Resetear a la primera página cuando se filtra
    this.paginaActual = 0;
    // Calcular las fiestas paginadas
    this.calcularFiestasPaginadas();
  }

  calcularFiestasPaginadas() {
    const startIndex = this.paginaActual * this.tamañoPagina;
    const endIndex = startIndex + this.tamañoPagina;
    this.fiestasPaginadas = this.fiestasFiltradas.slice(startIndex, endIndex);
  }

  getFiestas(page: number, size: number) {
    this.cargando = true;
    this.administradorService.getFiestas().subscribe(res => {
      console.log('Fiestas recibidas:', res);
      if (Array.isArray(res.fiesta)) {
        this.listaFiestas = res.fiesta;
        this.filtrarFiestas();
        this.cargando = false;
      } else {
        this.listaFiestas = [];
        this.fiestasFiltradas = [];
        this.totalPaginas = 0;
        this.cargando = false;
        console.warn('La propiedad Fiestas no es un array:', res.fiesta);
      }
    });
  }

  getFiestasPaginadas() {
    return this.fiestasPaginadas;
  }

  anteriorPaginaFiestas() {
    if (this.paginaActual > 0 && !this.cargando) {
      this.cargando = true;
      // Vaciar el array para disparar animación de salida
      this.fiestasPaginadas = [];
      setTimeout(() => {
        this.paginaActual--;
        this.calcularFiestasPaginadas();
        this.cargando = false;
      }, 400); // Delay igual a la duración de la animación de salida
    }
  }

  siguientePaginaFiestas() {
    if (this.paginaActual < this.totalPaginas - 1 && !this.cargando) {
      this.cargando = true;
      // Vaciar el array para disparar animación de salida
      this.fiestasPaginadas = [];
      setTimeout(() => {
        this.paginaActual++;
        this.calcularFiestasPaginadas();
        this.cargando = false;
      }, 400); // Delay igual a la duración de la animación de salida
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

aceptarFiesta(fiesta: any) {
  const id = fiesta.id;
  const nombreUsuario = fiesta.cliente?.nombreUsuario;

  if (!nombreUsuario) {
    console.error('No se pudo obtener el nombre de usuario del cliente.');
    return;
  }

  this.administradorService.aceptarFiesta(id, nombreUsuario).subscribe({
    next: () => {
      this.getFiestas(this.paginaActual, this.tamañoPagina);

      Swal.fire({
        icon: 'success',
        title: 'Aceptada',
        text: 'La fiesta ha sido aceptada y los ingredientes descontados.',
        timer: 2000,
        showConfirmButton: false
      });
    },
    error: (error) => {
      console.error('Error al aceptar la fiesta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo aceptar la fiesta. Verifique que haya suficientes ingredientes.',
        timer: 3000,
        showConfirmButton: false
      });
    }
  });
}

cancelarFiesta(fiesta: any) {
  const id = fiesta.id;
  const nombreUsuario = fiesta.cliente?.nombreUsuario;

  if (!nombreUsuario) {
    console.error('No se pudo obtener el nombre de usuario del cliente.');
    return;
  }

  this.administradorService.cancelarFiesta(id, nombreUsuario).subscribe({
    next: () => {
      this.getFiestas(this.paginaActual, this.tamañoPagina);

      Swal.fire({
        icon: 'success',
        title: 'Cancelada',
        text: 'La fiesta ha sido cancelada.',
        timer: 2000,
        showConfirmButton: false
      });
    },
    error: (error) => {
      console.error('Error al cancelar la fiesta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cancelar la fiesta.',
        timer: 3000,
        showConfirmButton: false
      });
    }
  });
}

finalizarFiesta(fiesta: any) {
  Swal.fire({
    title: '¿Finalizar fiesta?',
    text: '¿Estás seguro de que deseas marcar esta fiesta como finalizada?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ffa500',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, finalizar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.administradorService.finalizarFiesta(fiesta.id).subscribe({
        next: () => {
          Swal.fire('Finalizada', 'La fiesta ha sido finalizada.', 'success');
          this.getFiestas(this.paginaActual, this.tamañoPagina);
        },
        error: () => {
          Swal.fire('Error', 'No se pudo finalizar la fiesta.', 'error');
        }
      });
    }
  });
}
}








