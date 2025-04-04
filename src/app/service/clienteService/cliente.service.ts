import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

// Definimos una interfaz para la respuesta de autenticación
interface AuthResponse {
  token: string;
  nombreUsuario: string;
  tipo: boolean;
  // Otros campos que pueda devolver tu API
}

 interface datosCliente {
  email: string;
  direccion: string;
  telefono: string;
  tipoCliente: string;
  agencia: string | null | undefined;
}

interface datosPedidosCliente {
  id: number;
  fecha_entrega: string;
  estado: string;
  direccion: string;
}

interface datosFiestasCliente {
  id: number;
  fechaFiesta: string;
  direccion: string;
}

interface PizzaDetalle {
  tipo: string;
  cantidad: number;
  gusto: string;
  precio: number;
}

interface arrayDetallesPedido {
  detallesPedido: detallesPedido[];
}

interface detallesPedido {
  metodoPago: string;
  direccionEntrega: string;
  periodicidad: string;
  fechaEntrega: string;
  pizzas: PizzaDetalle[];
  precioTotal: string;

}

interface detallesFiesta {
  cantidadPersonas: string;
  fechaFiesta: string;
  horaServir: string;
  metodoPago: string;
  chivito: string;
  hamburguesa: string;
  precio: string;
  direccion: string;

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
        // Almacenar detalles del usuario y token JWT en localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  elegirTipoDireccionClienteFinal(nombreUsuario: string, tipo: string, direccion: string): any {
    const requestBody = { nombreUsuario, tipo, direccion };
    
    this.http.post<any>(`http://localhost:8080/api/clientes/elegirTipoDireccionClienteFinal`, requestBody)
      .subscribe(
        (response) => {
          console.log('Respuesta exitosa:', response);
  
          // Actualizar solo si la respuesta es exitosa y contiene datos relevantes
          if (response && response.tipo !== undefined) {
            let currentUser = this.getUserFromLocalStorage();

            if (currentUser) {
              // Usamos el tipo que devuelve el servidor en la respuesta
              currentUser.tipo = response.tipo; 
              console.log('Tipo actualizado:', currentUser.tipo);
              // Guardamos el usuario actualizado en localStorage
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
              // Notificamos el cambio a los suscriptores
              this.currentUserSubject.next(currentUser);
            }
          }
        },
        (error) => {
          console.error('Hubo un error:', error);
        }
      );
  }
  
  
  elegirTipoDireccionComercio(nombreUsuario: string, tipo: string, direccion: string): any {
    const requestBody = { nombreUsuario, tipo, direccion };
    
    this.http.post<any>(`http://localhost:8080/api/clientes/elegirTipoDireccionComercio`, requestBody)
      .subscribe(
        (response) => {
          console.log('Respuesta exitosa:', response);
  
          // Actualizar solo si la respuesta es exitosa y contiene datos relevantes
          if (response && response.tipo !== undefined) {
            let currentUser = this.getUserFromLocalStorage();

            if (currentUser) {
              // Usamos el tipo que devuelve el servidor en la respuesta
              currentUser.tipo = response.tipo; 
              console.log('Tipo actualizado:', currentUser.tipo);
              // Guardamos el usuario actualizado en localStorage
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
              // Notificamos el cambio a los suscriptores
              this.currentUserSubject.next(currentUser);
            }
          }
        },
        (error) => {
          console.error('Hubo un error:', error);
        }
      );

  }
  
  elegirTipoDireccionBeneficio(nombreUsuario: string, motivo: string, direccion: string): any {
    const requestBody = { nombreUsuario, motivo, direccion };
    
    this.http.post<any>(`http://localhost:8080/api/clientes/elegirTipoDireccionBeneficio`, requestBody)
      .subscribe(
        (response) => {
          console.log('Respuesta exitosa:', response);
  
          // Actualizar solo si la respuesta es exitosa y contiene datos relevantes
          if (response && response.tipo !== undefined) {
            let currentUser = this.getUserFromLocalStorage();

            if (currentUser) {
              // Usamos el tipo que devuelve el servidor en la respuesta
              currentUser.tipo = response.tipo; 
              console.log('Tipo actualizado:', currentUser.tipo);
              // Guardamos el usuario actualizado en localStorage
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
              // Notificamos el cambio a los suscriptores
              this.currentUserSubject.next(currentUser);
            }
          }
        },
        (error) => {
          console.error('Hubo un error:', error);
        }
      );
  }

  elegirTipoDireccionExterior(nombreUsuario: string, agencia: string, direccion: string): any{
    const requestBody = { nombreUsuario, agencia, direccion };
    
    this.http.post<any>(`http://localhost:8080/api/clientes/elegirTipoDireccionExterior`, requestBody)
      .subscribe(
        (response) => {
          console.log('Respuesta exitosa:', response);
  
          // Actualizar solo si la respuesta es exitosa y contiene datos relevantes
          if (response && response.tipo !== undefined) {
            let currentUser = this.getUserFromLocalStorage();

            if (currentUser) {
              // Usamos el tipo que devuelve el servidor en la respuesta
              currentUser.tipo = response.tipo; 
              console.log('Tipo actualizado:', currentUser.tipo);
              // Guardamos el usuario actualizado en localStorage
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
              // Notificamos el cambio a los suscriptores
              this.currentUserSubject.next(currentUser);
            }
          }
        },
        (error) => {
          console.error('Hubo un error:', error);
        }
      );
  }

  getDatosCliente(nombreUsuario: string): Observable<datosCliente> {
    const requestBody = { nombreUsuario};
    
    return this.http.post<datosCliente>(`http://localhost:8080/api/clientes/getDatosCliente`, requestBody)

  }

  getPedidosCliente(nombreUsuario: string): Observable<datosPedidosCliente> {
    const requestBody = { nombreUsuario};
    
    return this.http.post<datosPedidosCliente>(`http://localhost:8080/api/clientes/getPedidosCliente`, requestBody)

  }

  getFiestasCliente(nombreUsuario: string): Observable<datosFiestasCliente> {
    const requestBody = { nombreUsuario};
    
    return this.http.post<datosFiestasCliente>(`http://localhost:8080/api/clientes/getFiestasCliente`, requestBody)

  }

  actualizarPerfilCliente(datosActualizarPerfil: any): Observable<any> {
    return this.http.post<any>(`http://localhost:8080/api/clientes/actualizarPerfilCliente`, datosActualizarPerfil)
      .pipe(
        tap(response => {
          if (response) {
            // Actualizar el usuario en localStorage si la actualización fue exitosa
            const currentUser = this.getUserFromLocalStorage();
            if (currentUser) {
              currentUser.email = datosActualizarPerfil.email;
              currentUser.telefono = datosActualizarPerfil.telefono;
              currentUser.direccion = datosActualizarPerfil.direccion;
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
              this.currentUserSubject.next(currentUser);
            }
          }
        })
      );
  }

  detallesPedido(nombreUsuario: string, id: number): Observable<detallesPedido[]> {
    // Crear el objeto de solicitud con el ID del pedido si está disponible
    console.log("pedidoID: ", id);
    const requestBody = { nombreUsuario, id};
    
    return this.http.post<detallesPedido[]>(
      `http://localhost:8080/api/clientes/detallesPedido`, 
      requestBody
    );
  }
  
  detallesFiesta(nombreUsuario: string, id: number): Observable<detallesFiesta> {
    // Crear el objeto de solicitud con el ID del pedido si está disponible
    console.log("fiestaIDCS: ", id);
    const requestBody = { nombreUsuario, id};
    
    return this.http.post<detallesFiesta>(
      `http://localhost:8080/api/clientes/detallesFiesta`, 
      requestBody
    );
  }

  

  logout() {
    // Eliminar usuario del localStorage al cerrar sesión
    localStorage.removeItem('currentUser');
    localStorage.clear();
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