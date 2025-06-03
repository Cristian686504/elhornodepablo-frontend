import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { trigger, transition, style, animate, query, group, stagger} from '@angular/animations';

interface Pizza {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

interface PizzaResponse {
  pizza: Pizza[];
}

@Component({
  selector: 'menu-pizza',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatBadgeModule,
    MatStepperModule
  ],
  templateUrl: './menu-pizza.component.html',
  styleUrls: ['./menu-pizza.component.css'],
  animations: [
    trigger('scaleFade', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})

export class MenuPizzaComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() pizzasSeleccionadas = new EventEmitter<any[]>();
  @Output() avanzarStep = new EventEmitter<void>();
  @Output() paginaCambiada = new EventEmitter<number>();


  
  pizzas: Pizza[] = []; 
  loading = true;
  error = false;
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPizzas();
  }

  cargarPizzas(): void {
    this.loading = true;
    this.error = false;
    
    this.getPizzas().subscribe(
      (data: PizzaResponse) => {
        console.log(data);
        this.pizzas = data.pizza.map(pizza => ({
          id: pizza.id,
          nombre: pizza.nombre,
          descripcion: pizza.descripcion,
          precio: pizza.precio,
          imagen: this.imagenABase64(pizza.imagen),
          cantidad: 0
        }));
        this.loading = false;
      },
      (error) => {
        console.error('Error cargando pizzas:', error);
        this.error = true;
        this.loading = false;
      }
    );
  }

  getPizzas(): Observable<PizzaResponse> {
    return this.http.get<PizzaResponse>('http://localhost:8080/api/pizza/getPizzas')
      .pipe(
        catchError(err => {
          console.error('Prueba:', err);
          return of({
            pizza: [
            { id: 1, nombre: 'Muzzarella', descripcion: 'Queso muzzarella y salsa de tomate, sin nada más', precio: 200, imagen: '', cantidad: 0 },
            { id: 2, nombre: 'Panceta', descripcion: 'Queso muzzarella, salsa de tomate y panceta', precio: 280, imagen: '', cantidad: 0 },
            { id: 3, nombre: 'Aceituna', descripcion: 'Queso mozzarella, salsa de tomate y aceitunas', precio: 320, imagen: '', cantidad: 0 },
            { id: 4, nombre: 'Capresse', descripcion: 'Queso mozzarella, salsa de tomate, tomate cherry y albahaca', precio: 400, imagen: '', cantidad: 0 },
            { id: 5, nombre: 'Muzzarella', descripcion: 'Queso muzzarella y salsa de tomate, sin nada más', precio: 200, imagen: '', cantidad: 0 },
            { id: 6, nombre: 'Panceta', descripcion: 'Queso muzzarella, salsa de tomate y panceta', precio: 280, imagen: '', cantidad: 0 },
            { id: 7, nombre: 'Aceituna', descripcion: 'Queso mozzarella, salsa de tomate y aceitunas', precio: 320, imagen: '', cantidad: 0 },
            { id: 8, nombre: 'Capresse', descripcion: 'Queso mozzarella, salsa de tomate, tomate cherry y albahaca', precio: 400, imagen: '', cantidad: 0 },
          ]});
        })
      );
  }

  imagenABase64(imagen: string): string {
    if (!imagen) {
      return 'images/pizza-default.jpg';
    }
    return `data:image/jpeg;base64,${imagen}`;
  }

  aumentarCantidad(pizza: Pizza): void {
  pizza.cantidad++;
  event?.preventDefault(); 
  event?.stopPropagation(); 
}

reducirCantidad(pizza: Pizza): void {
  if (pizza.cantidad > 0) {
    pizza.cantidad--;
    event?.preventDefault();
    event?.stopPropagation(); 
  }
}

  getPizzasSeleccionadas(): Pizza[] {
    return this.pizzas.filter(pizza => pizza.cantidad > 0);
  }

  calcularTotal(): number {
    return this.getPizzasSeleccionadas()
      .reduce((total, pizza) => total + (pizza.precio * pizza.cantidad), 0);
  }

  
  onPizzaStepNext(): void {
    const seleccionadas = this.getPizzasSeleccionadas();
  
    const datosPedidoForm = this.parentForm.get('datosPedido');
    if (datosPedidoForm) {
      const pizza = seleccionadas[0];
      datosPedidoForm.patchValue({
        tipoPizza: pizza.id,
        cantidad: pizza.cantidad
      });
    }
    this.pizzasSeleccionadas.emit(seleccionadas);
    this.avanzarStep.emit();
  }

  pizzasPorPagina = 6;
  paginaActual = 0;

  get pizzasPaginadas() {
    const start = this.paginaActual * this.pizzasPorPagina;
    return this.pizzas.slice(start, start + this.pizzasPorPagina);
  }

  get totalPaginas() {
    return Math.ceil(this.pizzas.length / this.pizzasPorPagina);
  }

  posicionScroll = 0;

  onNextPage(): void {
    if (this.paginaActual + 1 < this.totalPaginas) {
      this.posicionScroll = window.pageYOffset;
      this.paginaActual++;
      this.paginaCambiada.emit(this.paginaActual);
      setTimeout(() => window.scrollTo(0, this.posicionScroll), 0);
    }
  }

  onPrevPage(): void {
    if (this.paginaActual > 0) {
      this.posicionScroll = window.pageYOffset;
      this.paginaActual--;
      this.paginaCambiada.emit(this.paginaActual);
      setTimeout(() => window.scrollTo(0, this.posicionScroll), 0);
    }
  }
}
