import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ClienteService } from '../clienteService/cliente.service';
import { AdministradorService } from '../administradorService/administrador.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const administradorService = inject(AdministradorService);
  const currentAdminUser = administradorService.currentUserValue;
  const clienteService = inject(ClienteService);
  const currentUser = clienteService.currentUserValue;

  if (currentUser && currentUser.token) {
    console.log(currentUser.token);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
      }
    });
  } else if (currentAdminUser && currentAdminUser.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentAdminUser.token}`
      }
    });
  }
  return next(req);
};