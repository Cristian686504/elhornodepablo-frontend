import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClienteService } from '../service/clienteService/cliente.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  usuario = { nombreUsuario: '', contrasenia: '', email: '', telefono: '' };

  constructor(private clienteService: ClienteService, private router: Router ) {}

  registrarse() {
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
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        let errorMsg = 'Error al registrar. Por favor, intente de nuevo.';
        
        if (error.error && typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.status === 400) {
          errorMsg = 'Datos de registro inválidos. Verifique la información.';
        }
        
        alert(errorMsg);
      }
    });
  }



}
