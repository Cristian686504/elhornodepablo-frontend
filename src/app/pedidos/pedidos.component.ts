import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ClienteService } from '../service/clienteService/cliente.service';
import { Router } from '@angular/router';
import { MenuPizzaComponent } from "../menu-pizza/menu-pizza.component";
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

defineLocale('es', esLocale);

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatRadioModule,
    BsDatepickerModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MenuPizzaComponent
],
  providers: [provideAnimations()],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
    pedidoForm!: FormGroup;
    agenciaEnvio: string = '';

    bsConfig: Partial<BsDatepickerConfig> = {
      containerClass: 'theme-red',
      dateInputFormat: 'DD/MM/YYYY',
      showWeekNumbers: false,
      minDate: new Date()
    };
    
    metodoEntrega = [
      { value: 'delivery', viewValue: 'Delivery a domicilio' },
      { value: 'entregaLocal', viewValue: 'Entrega en el local' }
    ];

    metodoPago = [
      { value: 'EFECTIVO', viewValue: 'Efectivo' },
      { value: 'TRANSFERENCIA', viewValue: 'Transferencia' }
    ];

    periodicidadPago = [
      { value: 'diario', viewValue: 'Diario' },
      { value: 'semanal', viewValue: 'Semanal' },
      { value: 'mensual', viewValue: 'Mensual' }
    ];
  
    constructor(
      private fb: FormBuilder,
      private clienteService: ClienteService,
      private router: Router,
      private localeService: BsLocaleService
    ) { this.localeService.use('es')}
  
    ngOnInit(): void {
      this.pedidoForm = this.fb.group({
        usuario: this.fb.group({
          usuario: ""
        }),

        datosPedido: this.fb.group({
          tipoPizza: ['', Validators.required],
          cantidad: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
        }),
        
        detallesEntrega: this.fb.group({
          fechaEntrega: [null, Validators.required],
          metodo: ['delivery', Validators.required],
          detallesDelivery: this.fb.group({
            direccion: [''],
            esExterior: [false],
            agenciaEnvio: ['']
          })
        }),
        
        detallesPago: this.fb.group({
          metodoPago: ['efectivo', Validators.required],
          esPeriodico: [false],
          periodicidad: [''],
          esBeneficio: [false],
          motivoBeneficio: ['']
        })
      });
      
      this.onChangeMetodoDelivery();

      this.pedidoForm.get('detallesPago.esPeriodico')?.valueChanges.subscribe(isPeriodico => {
        const periodicidadControl = this.pedidoForm.get('detallesPago.periodicidad');
        if (isPeriodico) {
          periodicidadControl?.setValidators([Validators.required]);
        } else {
          periodicidadControl?.clearValidators();
          periodicidadControl?.setValue('');
        }
        periodicidadControl?.updateValueAndValidity();
      });

      this.pedidoForm.get('detallesPago.esBeneficio')?.valueChanges.subscribe(isBeneficio => {
        const motivoControl = this.pedidoForm.get('detallesPago.motivoBeneficio');
        if (isBeneficio) {
          motivoControl?.setValidators([Validators.required]);
        } else {
          motivoControl?.clearValidators();
          motivoControl?.setValue('');
        }
        motivoControl?.updateValueAndValidity();
      });

      this.pedidoForm.get('detallesEntrega.detallesDelivery.esExterior')?.valueChanges.subscribe(esExterior => {
        const agenciaEnvioControl = this.pedidoForm.get('detallesEntrega.detallesDelivery.agenciaEnvio');
        if (esExterior) {
          agenciaEnvioControl?.setValidators([Validators.required]);
        } else {
          agenciaEnvioControl?.clearValidators();
          agenciaEnvioControl?.setValue('');
        }
        agenciaEnvioControl?.updateValueAndValidity();
      });
    }
    
    onChangeMetodoDelivery(): void {
      const metodoControl = this.pedidoForm.get('detallesEntrega.metodo');
      const detallesDeliveryGroup = this.pedidoForm.get('detallesEntrega.detallesDelivery');
      
      if (!metodoControl) return;
      
      metodoControl.valueChanges.subscribe(metodo => {
        if (!detallesDeliveryGroup) return;
        
        const direccionControl = detallesDeliveryGroup.get('direccion');
        
        if (metodo === 'delivery') {
          direccionControl?.setValidators([Validators.required]);
          direccionControl?.updateValueAndValidity();
        } else {
          direccionControl?.clearValidators();
          direccionControl?.updateValueAndValidity();
        }
      });
    }
    
    onSubmit(): void {
      if (this.pedidoForm.valid) {    

        const pizzasValidas = this.pizzasSeleccionadas.filter(p => p.cantidad > 0);
        if (pizzasValidas.length === 0) {
          alert('Debes seleccionar al menos una pizza con cantidad mayor a cero.');
          return;
        }
        
        const pedidoData = this.pedidoForm.value;

        const pedidoRequest = {
          nombreUsuario: this.clienteService.currentUserValue.nombreUsuario,
          
          direccion: pedidoData.detallesEntrega.metodo === "entregaLocal" 
            ? "Retiro en local" 
            : pedidoData.detallesEntrega.detallesDelivery.direccion,
          
          entrega: pedidoData.detallesEntrega.metodo !== "entregaLocal",
          
          fechaEntrega: pedidoData.detallesEntrega.fechaEntrega.toISOString().split('T')[0],
          
          metodoPago: pedidoData.detallesPago.metodoPago,
          
          periodicidad: pedidoData.detallesPago.esPeriodico ? pedidoData.detallesPago.periodicidad : "",
          
          agenciaEnvio: pedidoData.detallesEntrega.detallesDelivery.agenciaEnvio,

          motivoBeneficio: pedidoData.detallesPago.motivoBeneficio,

          pizzas: pizzasValidas.map(pizza => ({
            pizza: { id: pizza.id },
            cantidad: pizza.cantidad
          })),
        };
        
        console.log('Pedido enviado:', pedidoRequest);

        this.clienteService.crearPedido(pedidoRequest).subscribe(
          response => {
            alert(response.mensaje || 'Pedido creado exitosamente');
            this.pedidoForm.reset();
            this.router.navigate(['/']);
          },
          error => {
            console.error('Error al crear pedido', error);
            alert('Error al crear el pedido. Por favor, intente nuevamente más tarde.');
          }
        );
      } else {
        this.pedidoForm.markAllAsTouched();
        alert('Por favor, complete correctamente todos los campos requeridos.');
      }
    }

    pizzasSeleccionadas: any[] = [];

    onPizzasSeleccionadas(pizzas: any[]): void {
      this.pizzasSeleccionadas = pizzas;
      console.log('Pizzas:', pizzas);
    }

    calcularTotal(): number {
      return this.pizzasSeleccionadas
        .reduce((total, pizza) => total + (pizza.precio * pizza.cantidad), 0);
    }
    
}
  