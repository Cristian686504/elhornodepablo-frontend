import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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


  constructor(private clienteService: ClienteService, private administradorService: AdministradorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.clienteService.currentUser.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.currentUserAdmin = null; // aseguramos que solo haya uno activo
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
      }
    });
  }
  

cerrarSesion(){
  this.administradorService.logout();
}

irInicio() {
if (this.currentUser) {
    this.router.navigate(['/']);
  }
}
}