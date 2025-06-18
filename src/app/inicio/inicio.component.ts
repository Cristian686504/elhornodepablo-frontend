import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClienteService } from '../service/clienteService/cliente.service';
import { AdministradorService } from '../service/administradorService/administrador.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-inicio',
  standalone: true,
  imports : [ CommonModule, MatIconModule, RouterModule ],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentUserAdmin: any = null;

  mensajes = [
    '🚚 Delivery en toda la ciudad',
    '🌱 Ingredientes frescos y naturales',
    '🎉 Fiestas personalizadas para vos'
  ];
  
  mensajeTira = this.mensajes[0];
  private intervalo: any;
  
  
  constructor(
    private clienteService: ClienteService,
    private administradorService: AdministradorService) {
    this.iniciarTira();
  }

  ngOnInit() {
    this.clienteService.currentUser.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.currentUserAdmin = null;
      } else {
        this.checkAdminUser();
      }
    });
  }
  

  checkAdminUser() {
    this.administradorService.currentUser.subscribe(user => {
      if (user) {
        this.currentUserAdmin = user;
        this.currentUser = null; 
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  private iniciarTira(): void {
    let i = 0;
    this.intervalo = setInterval(() => {
      i = (i + 1) % this.mensajes.length;
      this.mensajeTira = this.mensajes[i];
    }, 4000);
  }
}