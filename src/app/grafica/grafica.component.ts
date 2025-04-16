import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AdministradorService } from '../service/administradorService/administrador.service';

@Component({
  selector: 'app-grafica',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './grafica.component.html',
  styleUrl: './grafica.component.css'
})
export class GraficaComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  anio: string = '2025';
  ingrediente: string = 'Harina';

  // Mapa de ingredientes a sus unidades de medida
  private unidadesPorIngrediente: Record<string, string> = {
    'Harina': 'g',
    'Azúcar': 'g',
    'Sal': 'g',
    'Levadura': 'g',
    'Agua': 'ml',
    'Muzzarella': 'g',
    'Panceta': 'g',
    'Aceituna': '',  
    'Jamón': 'g',
    'Capresse': 'g',
    'Pesto': 'g',
    'Roquefort': 'g',
    'Hawaiana': 'g',
    'Longaniza': 'g',
    'Bondiola y rucula': 'g',
    'Anchoas': '',

  };

  // Obtiene la unidad para el ingrediente actual
  private obtenerUnidad(): string {
    return this.unidadesPorIngrediente[this.ingrediente] || '';
  }

  // Obtiene el texto completo para el eje Y
  private obtenerTextoEjeY(): string {
    const unidad = this.obtenerUnidad();
    return unidad ? `Cantidad (${unidad})` : 'Cantidad';
  }

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [
      {
        data: [],
        label: '',
        fill: false,
        tension: 0.1,
        borderColor: 'rgb(53,53,52);',
        backgroundColor: 'rgba(236, 87, 12, 0.23)',
        pointBackgroundColor : 'rgb(236,85,12)',
      },
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
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
              const unidad = this.obtenerUnidad();
              if (unidad) {
                label += ` ${unidad}`;
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
          text: this.obtenerTextoEjeY(),
          font: {
            size: 14
          }
        },
        ticks: {
          callback: (value) => {
            const unidad = this.obtenerUnidad();
            return unidad ? `${value} ${unidad}` : value;
          }
        }
      }
    }
  };

  constructor(private administradorService: AdministradorService) { }

  ngOnInit(): void {
    this.getIngredientesUsados();
  }

  getIngredientesUsados() {
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
          
          // Actualizar opciones del gráfico con las unidades adecuadas
          this.actualizarUnidadesGrafico();
          
          // Actualizar el gráfico
          if (this.chart) {
            this.chart.update();
          }
        },
        error: (err) => {
          console.error('Error al obtener ingredientes usados:', err);
        }
      });
  }

  // Método para actualizar las unidades del gráfico cuando cambia el ingrediente
  actualizarUnidadesGrafico() {
    if (this.lineChartOptions.scales && this.lineChartOptions.scales['y'] && this.lineChartOptions.scales['y'].title) {
      // Modificar el texto del título
      this.lineChartOptions.scales['y'].title.text = this.obtenerTextoEjeY();
      
      // Crear nuevas opciones completas y asignarlas
      this.lineChartOptions = {...this.lineChartOptions};
      
      // Actualizar el gráfico
      if (this.chart) {
        this.chart.chart?.update(); 
      }
    }
  }
}