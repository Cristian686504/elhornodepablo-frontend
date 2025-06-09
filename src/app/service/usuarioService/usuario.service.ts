import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  nombreUsuario: string;
}

interface getClientes {
  id: number;
  nombreUsuario: string;
  contrasenia : string;
  nombreCompleto: string;
  direccion: string;
  email: string;
  telefono: string;
  tipoCliente: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  private API_URL = 'http://localhost:8080/api/clientes/';
  private API_URL_USUARIO = 'http://localhost:8080/api/usuarios/';

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
        localStorage.setItem('normalUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  logout() {
    localStorage.removeItem('normalUser');
    this.currentUserSubject.next(null);
    window.location.href = '/login';
  }

  private getUserFromLocalStorage() {
    const userJson = localStorage.getItem('normalUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!user && !!user.token;
  }

  getClientes(): Observable<{ clientes: getClientes[] }> {
    return this.http.get<{ clientes: getClientes[] }>(`${this.API_URL}getClientes`)
      .pipe(
        tap(res => console.log('📦 Clientes recibidos desde backend:', res))
      );
  }
  

  CrearUsuario(usuario: any): Observable<string> {
    return this.http.post<string>(`${this.API_URL}crearCliente`, usuario,
      { responseType: 'text' as 'json' });
  }

  eliminarCliente(id: number): Observable<string> {
    const token = this.currentUserValue?.token; // Obtener el token de autenticación
    const headers = {
      Authorization: `Bearer ${token}` // Añadir el token a las cabeceras
    };
  
    return this.http.delete<string>(`${this.API_URL_USUARIO}eliminar/${id}`, {
      headers: headers,
      responseType: 'text' as 'json'
    }).pipe(
      tap({
        next: (res) => console.log('Cliente eliminado correctamente', res),
        error: (err) => {
          console.error('Error al eliminar el cliente:', err);
          alert(`Ocurrió un error al eliminar el cliente: ${err.message}`);
        }
      })
    );
  }

   actualizarCliente(id: number, datosCliente: getClientes): Observable<any> {
      return this.http.put<any>(`${this.API_URL}modificarCliente/${id}`, datosCliente, { responseType: 'text' as 'json' }).pipe(
        tap(response => {
          if (response) {
            const currentUser = this.getUserFromLocalStorage();
            if (currentUser && currentUser.nombreUsuario === datosCliente.nombreUsuario) {
              currentUser.nombreUsuario = datosCliente.nombreUsuario;
              localStorage.setItem('adminUser', JSON.stringify(currentUser));
              this.currentUserSubject.next(currentUser);
            }
          }
        })
      );
    }

    getClientesPaginados(page: number, size: number): Observable<{
      content: getClientes[];
      totalElements: number;
      totalPages: number;
      number: number;
    }> {
      return this.http.get<{
        content: getClientes[];
        totalElements: number;
        totalPages: number;
        number: number;
      }>(`${this.API_URL}obtenerClientesPaginados?page=${page}&size=${size}`);
    }
  
}
