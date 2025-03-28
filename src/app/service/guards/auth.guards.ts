import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ClienteService } from '../clienteService/cliente.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean {
    // Verificar si el usuario está autenticado
    if (this.clienteService.isLoggedIn()) {
      return true; // Permitir acceso a rutas protegidas
    } else {
      // Redirigir al login si no está autenticado
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean {
    // Verificar si el usuario NO está autenticado
    if (!this.clienteService.isLoggedIn()) {
      return true; // Permitir acceso a rutas de autenticación
    } else {
      // Redirigir al dashboard principal si ya está autenticado
      this.router.navigate(['']);
      return false;
    }
  }
}