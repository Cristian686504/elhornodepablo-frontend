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

interface Pizza {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

interface PizzaResponse {
  pizzas: Pizza[];
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
  styleUrls: ['./menu-pizza.component.css']
})

export class MenuPizzaComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() pizzasSeleccionadas = new EventEmitter<any[]>();
  @Output() avanzarStep = new EventEmitter<void>();

  
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
        this.pizzas = data.pizzas.map(pizza => ({
          id: pizza.id,
          nombre: pizza.nombre,
          descripcion: pizza.descripcion,
          precio: pizza.precio,
          imagen: '',
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
    return this.http.get<PizzaResponse>('http://localhost:8080/api/pizzas/getPizzas')
      .pipe(
        catchError(err => {
          console.error('Prueba:', err);
          return of({
            pizzas: [
            { id: 1, nombre: 'Muzzarella', descripcion: 'Queso muzzarella y salsa de tomate', precio: 200, imagen: '', cantidad: 0 },
            { id: 2, nombre: 'Panceta', descripcion: 'Queso muzzarella, salsa de tomate y panceta', precio: 280, imagen: '', cantidad: 0 },
            { id: 3, nombre: 'Aceituna', descripcion: 'Queso mozzarella, salsa de tomate y aceitunas', precio: 320, imagen: '', cantidad: 0 },
            { id: 4, nombre: 'Capresse', descripcion: 'Queso mozzarella, salsa de tomate, tomate cherry y albahaca', precio: 400, imagen: '', cantidad: 0 },
          ]});
        })
      );
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
}
