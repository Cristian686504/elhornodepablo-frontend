import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Definimos una interfaz para la respuesta de autenticación
interface AuthResponse {
  token: string;
  nombreUsuario: string;
  // Otros campos que pueda devolver tu API
}

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  // Actualiza la URL para que apunte a nuestra nueva API de autenticación
  private API_URL = 'http://localhost:8080/api/administradores/';

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromLocalStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(nombreUsuario: string, contrasenia: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}login`, { nombreUsuario, contrasenia })
      .pipe(tap(user => {
        // Almacenar detalles del usuario y token JWT en localStorage
        localStorage.setItem('adminUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  logout() {
    // Eliminar usuario del localStorage al cerrar sesión
    localStorage.removeItem('adminUser');
    this.currentUserSubject.next(null);
    // Redirigir al login después de cerrar sesión y recargar la página
    window.location.href = '/admin';
  }

  private getUserFromLocalStorage() {
    const userJson = localStorage.getItem('adminUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!user && !!user.token;
  }
}