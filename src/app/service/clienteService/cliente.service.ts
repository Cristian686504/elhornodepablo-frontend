import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Definimos una interfaz para la respuesta de autenticación
interface AuthResponse {
  token: string;
  nombreUsuario: string;
  tipo: boolean;
  // Otros campos que pueda devolver tu API
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  // Actualiza la URL para que apunte a nuestra nueva API de autenticación
  private API_URL = 'http://localhost:8080/api/usuarios/';

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromLocalStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }


  registrar(usuario: any): Observable<string> {
    return this.http.post<string>(`http://localhost:8080/api/clientes/register`, usuario, 
      { responseType: 'text' as 'json' }); // Para manejar respuestas de tipo texto
  }

  login(nombreUsuario: string, contrasenia: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}login`, { nombreUsuario, contrasenia })
      .pipe(tap(user => {
        console.log('Respuesta del backend:', user);
        // Almacenar detalles del usuario y token JWT en localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  logout() {
    // Eliminar usuario del localStorage al cerrar sesión
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    // Redirigir al login después de cerrar sesión
    this.router.navigate(['/login']);
  }

  private getUserFromLocalStorage() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!user && !!user.token;
  }
}