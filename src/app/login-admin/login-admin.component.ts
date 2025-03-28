import { Component } from '@angular/core';
import { AdministradorService } from '../service/administradorService/administrador.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css'
})
export class LoginAdminComponent {

  usuario = { nombreUsuario: '', contrasenia: '' };
  loading = false;
  error = '';

  constructor(private administradorService: AdministradorService, private router: Router) { }

  iniciarSesion() {
    if (!this.usuario.nombreUsuario || !this.usuario.contrasenia) {
      this.error = 'Por favor ingrese usuario y contraseña';
      return;
    }

    this.loading = true;
    this.error = '';

    this.administradorService.login(this.usuario.nombreUsuario, this.usuario.contrasenia)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso', response);
          
          // Verificar que el token existe en la respuesta
          if (response && response.token) {
            // Redirigir a la página principal o dashboard
            this.router.navigate(['/gestion']);
          } else {
            this.error = 'Respuesta de autenticación inválida';
            console.warn('Respuesta no contiene token:', response);
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          console.error('Error al iniciar sesión', error);
          
          if (error.status === 401) {
            this.error = 'Usuario o contraseña incorrectos';
          } else if (error.status === 400) {
            this.error = 'Datos de inicio de sesión inválidos';
          } else {
            this.error = 'Error al iniciar sesión: ' + (error.error?.message || error.statusText || 'Error desconocido');
          }
        }
      });
  }
}
