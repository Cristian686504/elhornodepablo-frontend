import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClienteService } from '../service/clienteService/cliente.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  usuario = { nombreUsuario: '', nombreCompleto: '', contrasenia: '', email: '', telefono: '' };
  loading = false;
  error = '';


  constructor(private clienteService: ClienteService, private router: Router ) {}

  registrarse() {
    if (!this.usuario.nombreUsuario || !this.usuario.nombreCompleto || !this.usuario.contrasenia || !this.usuario.email || !this.usuario.telefono) {
      this.error = 'Por favor ingrese toda la información requerida';
      return;
    }

    this.loading = true;
    this.error = '';

    this.clienteService.registrar(this.usuario).subscribe({
      next: (response: string) => {
        console.log('Respuesta del servidor:', response);
        
        if (response.includes("éxito")) {
          console.log('Usuario registrado');
          this.router.navigate(['/login']);
        } else {
          console.warn('Respuesta inesperada:', response);
          alert(response);
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al registrar:', error);
        this.error = 'Error al registrar. Por favor, intente de nuevo.';
        
        if (error.error && typeof error.error === 'string') {
          this.error = error.error;
        } else if (error.status === 400) {
          this.error = 'Datos de registro inválidos. Verifique la información.';
        }
        else if (error.status === 409) {
          this.error = 'El nombre de usuario ya está en uso.';
        } else {
          this.error = 'Error desconocido. Por favor, intente más tarde.';
        }
      }
    });
  }



}
