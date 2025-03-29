import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ClienteService } from '../clienteService/cliente.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const clienteService = inject(ClienteService);
  const currentUser = clienteService.currentUserValue;
  
  if (currentUser && currentUser.token) {
    console.log(currentUser.token);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
      }
    });
  }
  
  return next(req);
};