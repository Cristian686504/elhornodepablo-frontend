import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClienteService } from '../service/clienteService/cliente.service';
import { AdministradorService } from '../service/administradorService/administrador.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentUser: any = null;
  currentUserAdmin: any = null;

  usuarioCargado = false;

  constructor(private clienteService: ClienteService, private administradorService: AdministradorService) {}

  ngOnInit() {
    this.clienteService.currentUser.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.currentUserAdmin = null; // aseguramos que solo haya uno activo
        this.usuarioCargado = true;
      } else {
        this.checkAdminUser();
      }
    });
  }
  

  checkAdminUser() {
    this.administradorService.currentUser.subscribe(user => {
      if (user) {
        this.currentUserAdmin = user;
        this.currentUser = null; // limpiamos por si acaso
        this.usuarioCargado = true;
      }
    });
  }
  

cerrarSesion(){
  this.administradorService.logout();
}
}