import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AdministradorService } from '../service/administradorService/administrador.service';

interface Ingrediente {
  id: number;
  nombre: string;
  unidad: string;
}

@Component({
  selector: 'app-grafica',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './grafica.component.html',
  styleUrl: './grafica.component.css'
})
export class GraficaComponent implements OnInit {
  @ViewChild('chartIngredientes') chartIngrediente?: BaseChartDirective;
  @ViewChild('chartIngresos') chartIngreso?: BaseChartDirective;

  anio: string = '2025';
  anioIngresos: string = '2025';
  ingrediente: string = ''; // valor del nombre del ingrediente seleccionado
  ingredientes: Ingrediente[] = []; // lista dinámica
  unidadIngrediente: string = ''; // unidad actual
  anios: string[] = [];

  constructor(private administradorService: AdministradorService) { }

  ngOnInit(): void {
    this.cargarIngredientes();
    this.getAnioGrafica();
    this.getIngresos();
  }

  cargarIngredientes(): void {
    this.administradorService.getIngredientes().subscribe({
      next: (lista) => {
        this.ingredientes = lista.ingrediente.map((i: any) => ({
          id: i.id,
          nombre: i.nombre,
          unidad: i.unidad_medida
        }));
        if (this.ingredientes.length > 0) {
          console.log('Lista de ingredientes:', this.ingredientes);
          this.ingrediente = this.ingredientes[0].nombre;
          this.unidadIngrediente = this.ingredientes[0].unidad;
          this.getIngredientesUsados();
        }
      },
      error: (err) => {
        console.error('Error al cargar ingredientes:', err);
      }
    });
  }


  // Obtiene el texto completo para el eje Y
  private obtenerTextoEjeY(): string {
    return this.unidadIngrediente ? `Cantidad (${this.unidadIngrediente})` : 'Cantidad';
  }

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [
      {
        data: [],
        label: '',
        fill: false,
        tension: 0.1,
        borderColor: 'rgb(53,53,52)',
        backgroundColor: 'rgba(236, 87, 12, 0.23)',
        pointBackgroundColor: 'rgb(236,85,12)',
      },
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
              if (this.unidadIngrediente) {
                label += ` ${this.unidadIngrediente}`;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '', // lo actualizas dinámicamente
          font: {
            size: 14
          }
        },
        ticks: {
          callback: (value) => {
            return this.unidadIngrediente ? `${value} ${this.unidadIngrediente}` : value;
          }
        }
      }
    }
  };

  public incomeChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [
      {
        data: [],
        label: 'Ingresos',
        fill: false,
        tension: 0.1,
        borderColor: 'rgb(53,53,52)',
        backgroundColor: 'rgba(236, 87, 12, 0.23)',
        pointBackgroundColor: 'rgb(236,85,12)',
      },
    ]
  };

  public incomeChartOptions: ChartOptions<'line'> = {
    responsive: true,
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `$${context.parsed.y.toLocaleString()}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Ingresos ($)',
          font: {
            size: 14
          }
        },
        ticks: {
          callback: (value) => {
            return `$${value}`;
          }
        }
      }
    }
  };


  getIngredientesUsados(): void {
    this.unidadIngrediente = this.ingredientes.find(i => i.nombre === this.ingrediente)?.unidad || '';
    console.log('Unidad del ingrediente:', this.unidadIngrediente);
    console.log('Ingrediente seleccionado:', this.ingrediente);

    this.administradorService.getIngredientesUsados(this.anio, this.ingrediente)
      .subscribe({
        next: (datos) => {
          const cantidades: number[] = [];
          const mesesOrdenados = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ];

          for (const mes of mesesOrdenados) {
            cantidades.push(datos[mes] ?? 0);
          }

          this.lineChartData.datasets[0].data = cantidades;
          this.lineChartData.datasets[0].label = this.ingrediente;

          this.actualizarUnidadesGrafico();

          if (this.chartIngrediente) {
            this.chartIngrediente?.chart?.update();

          }
        },
        error: (err) => {
          console.error('Error al obtener ingredientes usados:', err);
        }
      });
    this.actualizarUnidadesGrafico();
  }

  getIngresos(): void {
    this.administradorService.getIngresos(this.anioIngresos).subscribe({
      next: (datos) => {
        const ingresosMensuales: number[] = [];
        const mesesOrdenados = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        for (const mes of mesesOrdenados) {
          ingresosMensuales.push(datos[mes] ?? 0);
        }

          this.incomeChartData.datasets[0].data = ingresosMensuales;

          this.actualizarGraficoIngresos();

          if (this.chartIngreso) {
            this.chartIngreso?.chart?.update();

          }
        },
        error: (err) => {
          console.error('Error al obtener ingredientes usados:', err);
        }
      });
    this.actualizarGraficoIngresos();
  }

  actualizarUnidadesGrafico() {
    if (this.lineChartOptions.scales && this.lineChartOptions.scales['y'] && this.lineChartOptions.scales['y'].title) {
      this.lineChartOptions.scales['y'].title.text = this.obtenerTextoEjeY();
      this.lineChartOptions = { ...this.lineChartOptions };

      if (this.chartIngrediente) {
        this.chartIngrediente.chart?.update();
      }
    }
  }

  actualizarGraficoIngresos() {
    if (this.incomeChartOptions.scales && this.incomeChartOptions.scales['y'] && this.incomeChartOptions.scales['y'].title) {
      this.incomeChartOptions.scales['y'].title.text = 'Ingresos ($)';
      this.incomeChartOptions = { ...this.incomeChartOptions };

      if (this.chartIngreso) {
        this.chartIngreso.chart?.update();
      }
    }
  }
  
  getAnioGrafica(): void {
    this.administradorService.getAnioGrafica().subscribe({
      next: (lista) => {
        console.log('Respuesta del backend:', lista);
        this.anios = lista.anios; // ✅ usamos directamente "anios", no .map()

        if (this.anios.length > 0) {
          this.anio = this.anios[0]; // valor inicial
          this.getIngredientesUsados(); // carga inicial de datos
        }
      },
      error: (err) => {
        console.error('Error al obtener años:', err);
      }
    });
  }

}
