import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Router } from '@angular/router';
import { MapAddressModalComponent } from "../mapa-direccion/mapa-direccion.component";
import { MatIconModule } from '@angular/material/icon';
import { ClienteService } from '../service/clienteService/cliente.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-fiesta',
  templateUrl: './fiestas.component.html',
  styleUrls: ['./fiestas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatSlideToggleModule,
    BsDatepickerModule,
    NgxMatTimepickerModule,
    MapAddressModalComponent
],
})
export class FiestasComponent implements OnInit {
  fiestaForm!: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  fiestasAgendadas: { horaServir: string; fechaFiesta: string }[] = [];
  horaEnConflicto: string | null = null;

  precioBasePorPersona = 150.00;
  costoHamburguesas = 200.00;
  costoChivitos = 250.00;

  metodoPago = [
    { value: 'EFECTIVO', viewValue: 'Efectivo' },
    { value: 'TRANSFERENCIA', viewValue: 'Transferencia' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clienteService: ClienteService,  
  ) {
    
    this.bsConfig = {
      containerClass: 'theme-red',
      showWeekNumbers: false,
      dateInputFormat: 'DD/MM/YYYY',
      minDate: new Date()
    };
  }

  ngOnInit(): void {
    this.initializeForm();
    this.cargarFiestas();
  }

  initializeForm(): void {
    this.fiestaForm = this.fb.group({
      detallesFiesta: this.fb.group({
        numeroPersonas: ['', [Validators.required, Validators.min(1)]],
        incluirHamburguesas: [false],
        incluirChivitos: [false]
      }),
      detallesEvento: this.fb.group({
        fechaFiesta: ['', Validators.required],
        horaFiesta: ['', [Validators.required, this.validarHora]],
        direccion: ['', Validators.required]
      }),
      detallesPago: this.fb.group({
        metodoPago: ['', Validators.required]
      })
    });

    this.updateHoraValidator();

    this.fiestaForm.get('detallesEvento.fechaFiesta')?.valueChanges.subscribe(() => {
      this.updateHoraValidator();
    });
  }

  updateHoraValidator(): void {
    const fechaControl = this.fiestaForm.get('detallesEvento.fechaFiesta');
    const horaControl = this.fiestaForm.get('detallesEvento.horaFiesta');
    
    if (fechaControl && horaControl) {
      horaControl.setValidators([
        Validators.required,
        this.validarHoraConEventos(fechaControl, this.fiestasAgendadas)
      ]);
      horaControl.updateValueAndValidity();
    }
  }
  

  calcularTotalFiesta(): number {
    const numeroPersonas = this.fiestaForm.get('detallesFiesta.numeroPersonas')?.value || 0;
    const incluirHamburguesas = this.fiestaForm.get('detallesFiesta.incluirHamburguesas')?.value;
    const incluirChivitos = this.fiestaForm.get('detallesFiesta.incluirChivitos')?.value;

    let total = numeroPersonas * this.precioBasePorPersona;

    if (incluirHamburguesas) {
      total += numeroPersonas * this.costoHamburguesas;
    }

    if (incluirChivitos) {
      total += numeroPersonas * this.costoChivitos;
    }

    return total;
  }


  onSubmit(): void {
    if (this.fiestaForm.valid) {
      const fiestaData = {
        ...this.fiestaForm.value,
        totalCalculado: this.calcularTotalFiesta(),
        fechaCreacion: new Date()
      };

      const horaParsed = this.parseHoraFiesta(fiestaData.detallesEvento.horaFiesta);
      const localDateTime = new Date(fiestaData.detallesEvento.fechaFiesta);
      localDateTime.setHours(horaParsed.horas, horaParsed.minutos, 0, 0);
      const horaServir = this.horaSinTimezone(localDateTime);

      const fiestaRequest = {
        nombreUsuario: this.clienteService.currentUserValue.nombreUsuario,
        direccion: fiestaData.detallesEvento.direccion,
        cantidadPersonas: fiestaData.detallesFiesta.numeroPersonas,
        fechaFiesta: this.fechaSinTimezone(fiestaData.detallesEvento.fechaFiesta),
        horaServir: horaServir,
        hamburguesa: fiestaData.detallesFiesta.incluirHamburguesas,
        chivito: fiestaData.detallesFiesta.incluirChivitos,
        metodoPago : fiestaData.detallesPago.metodoPago,
        precio: fiestaData.totalCalculado,
      }

      console.log('Datos de la fiesta:', fiestaRequest);

      this.clienteService.crearFiesta(fiestaRequest).subscribe(
          response => {
            Swal.fire({ text: response.mensaje || 'Fiesta pedida exitosamente',
              icon: "success"
            });
            this.fiestaForm.reset();
            this.router.navigate(['/']);
          },
          error => {
            console.error('Error al pedir la fiesta', error);
            Swal.fire({text: 'Error al pedir la fiesta. Por favor, intente nuevamente más tarde.',
              icon: "error"
            });
          }
        );
    } else {
      this.fiestaForm.markAllAsTouched;
      Swal.fire({text: 'Por favor, complete correctamente todos los campos requeridos.',
        icon: "warning"
      });
    }
  }

  get numeroPersonas(): number {
    return this.fiestaForm.get('detallesFiesta.numeroPersonas')?.value || 0;
  }

  get incluirHamburguesas(): boolean {
    return this.fiestaForm.get('detallesFiesta.incluirHamburguesas')?.value;
  }

  get incluirChivitos(): boolean {
    return this.fiestaForm.get('detallesFiesta.incluirChivitos')?.value;
  }

  validarHora(control: AbstractControl) {
    if (!control.value) return null;

    const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const match = control.value.match(timeRegex);

    if (!match) {
      return { formatoInvalido: true }; 
    }

    let hora = parseInt(match[1], 10);
    const periodo = match[3].toUpperCase();

    if (periodo === 'PM' && hora !== 12) {
      hora += 12;
    } else if (periodo === 'AM' && hora === 12) {
      hora = 0;
    }

    if (hora < 7) {
      return { horaInvalida: true };
    }

    return null;
  }

  showMapa = false;
  direccionSeleccionada = '';
  
  get hasDireccionSeleccionada(): boolean {
    return !!this.direccionSeleccionada;
  }
  
  get showDireccionError(): boolean {
    const direccionControl = this.fiestaForm.get('detallesEvento.direccion');
    return direccionControl ? direccionControl.hasError('required') && direccionControl.touched : false;
  }
  
  openMapa(): void {
    this.showMapa = true;
  }
  
  onDireccionSeleccionada(event: { direccion: string, ubicacion: any }): void {
    this.direccionSeleccionada = event.direccion;
    this.fiestaForm.get('detallesEvento.direccion')?.setValue(event.direccion);
    this.showMapa = false;
  }
  
  onMapaClosed(): void {
    this.showMapa = false;
  }

  parseHoraFiesta(hora: string): { horas: number, minutos: number } {
    const match = hora.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
    if (!match) return {horas:1, minutos:1};

    let horas = parseInt(match[1], 10);
    const minutos = parseInt(match[2], 10);
    const meridiano = match[3]?.toUpperCase();

    if (meridiano === 'PM' && horas < 12) {
      horas += 12;
    } else if (meridiano === 'AM' && horas === 12) {
      horas = 0;
    }

    return { horas, minutos };
  }

  horaSinTimezone(date: Date): string {
    const y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, '0'); 
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');

    return `${y}-${M}-${d}T${h}:${m}:${s}`;
  }

  fechaSinTimezone(date: Date): string {
    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); 
    const dia = String(date.getDate()).padStart(2, '0');
    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');
    const segundo = String(date.getSeconds()).padStart(2, '0');

    return `${anio}-${mes}-${dia}T${hora}:${minuto}:${segundo}`;
  }

  validarHoraConEventos(
    fechaControl: AbstractControl,
    fiestasAgendadas: { horaServir: string; fechaFiesta: string }[]
  ): ValidatorFn {
    return (horaControl: AbstractControl): ValidationErrors | null => {
      const hora: string = horaControl.value;
      const fecha: Date = fechaControl.value;

      if (!fecha || !hora) {
        return null;
      }

      const parseTime = (timeStr: string): { hour: number; minute: number } | null => {
        const matchFormato12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!matchFormato12) {
          return null;
        }

        let h = parseInt(matchFormato12[1], 10);
        const m = parseInt(matchFormato12[2], 10);
        const mer = matchFormato12[3].toUpperCase();

        if (mer === 'PM' && h < 12) {
          h += 12;
        } else if (mer === 'AM' && h === 12) {
          h = 0;
        }

        return { hour: h, minute: m };
      };

      const formatearFecha = (fecha: Date): string => {
        let horas = fecha.getHours();
        const minutos = fecha.getMinutes();
        const amopm = horas >= 12 ? 'PM' : 'AM';
        
        horas = horas % 12;
        horas = horas ? horas : 12; 
        
        const strMinutos = minutos < 10 ? '0' + minutos : minutos.toString();
        return `${horas}:${strMinutos} ${amopm}`;
      };

      const parsed = parseTime(hora);
      if (!parsed) {
        return { formatoInvalido: true };
      }

      const { hour, minute } = parsed;
      const fechaSeleccionada = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        hour,
        minute,
        0,
        0
      );

      if (hour < 7) {
        return { horaFueraDeRango: true };
      }

      const y = fecha.getFullYear();
      const M = String(fecha.getMonth() + 1).padStart(2, '0');
      const d = String(fecha.getDate()).padStart(2, '0');
      const isoFecha = `${y}-${M}-${d}`;

       for (const fiesta of fiestasAgendadas) {
        if (fiesta.fechaFiesta === isoFecha) {
          const fiestaDateTime = new Date(fiesta.horaServir);
          const diffMins = Math.abs(fechaSeleccionada.getTime() - fiestaDateTime.getTime());
          const diffHoras = diffMins / (1000 * 60 * 60);

          if (diffHoras < 6) {
            const conflicto = formatearFecha(fiestaDateTime);
            this.horaEnConflicto = conflicto;           
            return { 
              conflictoHorario: true,
              horaEnConflicto: conflicto
            };
          }
        }
      }
      return null;
    };
  }
  
  cargarFiestas(): void {
    this.clienteService.getFechasHoras().subscribe(
      response => {
        this.fiestasAgendadas = response || [];
        
        if (this.fiestaForm) {
          this.updateHoraValidator();
        }
      },
      error => {
        console.error('Error cargando fiestas:', error);
        this.fiestasAgendadas = [];
      }
    );
  }

}
