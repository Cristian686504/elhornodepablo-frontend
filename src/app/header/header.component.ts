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

  constructor(private clienteService: ClienteService, private administradorService: AdministradorService) {}

ngOnInit() {
  this.clienteService.currentUser.subscribe(user => {
    if (user) {  // Verifica si el usuario no es null o undefined
      this.currentUser = user;
    } else {
      this.checkAdminUser(); // Si el cliente es null, revisa en administrador
    }
  });
}

checkAdminUser() {
  this.administradorService.currentUser.subscribe(user => {
    if (user) {
      this.currentUserAdmin = user;
    }
  });
}

checkTipoValue() {
  this.clienteService.currentUser.subscribe(user => {
    if (user) {  // Verifica si el usuario no es null o undefined
      this.currentUser = user;
    } else {
      this.checkAdminUser(); // Si el cliente es null, revisa en administrador
    }
  });
  console.log("valor:", this.currentUser.tipo)
  return this.currentUser.tipo;
}

cerrarSesion(){
  this.clienteService.logoutAdmin();
}
}