import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AdministradorService } from '../administradorService/administrador.service';
import { ClienteService } from '../clienteService/cliente.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardAdmin implements CanActivate {
  constructor(
    private administradorSerivice: AdministradorService,
    private clienteService: ClienteService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean {
    // Verificar si el usuario está autenticado
    if (this.administradorSerivice.isLoggedIn()) {
      return true; // Permitir acceso a rutas protegidas
    } else {
      // Redirigir al login si no está autenticado
      this.router.navigate(['/admin']);
      return false;
    }
  }
  
}



@Injectable({
  providedIn: 'root'
})
export class NoAuthGuardAdmin implements CanActivate {
  constructor(
    private administradorSerivice: AdministradorService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean {
    // Verificar si el usuario NO está autenticado
    if (!this.administradorSerivice.isLoggedIn()) {
      return true; // Permitir acceso a rutas de autenticación
    } else {
      // Redirigir al dashboard principal si ya está autenticado
      this.router.navigate(['/gestion']);
      return false;
    }
  }
}