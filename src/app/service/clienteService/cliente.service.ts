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
  estado: string;
  direccion: string;
}

interface PizzaDetalle {
  tipo: string;
  cantidad: number;
  gusto: string;
  precio: number;
}

interface detallesPedido {
  agencia: string;
  direccion: string;
  entrega: boolean;
  fechaEntrega: string;
  fechaPedido: string;
  metodoPago: string;
  periodicidad: string;
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
        localStorage.setItem('clienteUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  elegirTipoDireccion(nombreUsuario: string, tipo: string, direccion: string): any {
    const requestBody = { nombreUsuario, tipo, direccion };

    this.http.post<any>(`http://localhost:8080/api/clientes/elegirTipoDireccion`, requestBody)
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
              localStorage.setItem('clienteUser', JSON.stringify(currentUser));

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
    return this.http.get<datosCliente>(`http://localhost:8080/api/clientes/getDatosCliente/${nombreUsuario}`
    );
  }

  getPedidosCliente(nombreUsuario: string): Observable<datosPedidosCliente> {

    return this.http.get<datosPedidosCliente>(`http://localhost:8080/api/pedidos/getPedidosCliente/${nombreUsuario}`
    );

  }

  getFiestasCliente(nombreUsuario: string): Observable<datosFiestasCliente> {

    return this.http.get<datosFiestasCliente>(`http://localhost:8080/api/fiestas/getFiestasCliente/${nombreUsuario}`
    );

  }

  actualizarPerfilCliente(datosActualizarPerfil: any): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/api/clientes/actualizarPerfilCliente`, datosActualizarPerfil)
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


  detallesPedido(nombreUsuario: string, id: number): Observable<detallesPedido> {
    console.log("pedidoID: ", id);

    return this.http.get<detallesPedido>(
      `http://localhost:8080/api/pedidos/detallesPedido/${id}/${nombreUsuario}`
    );
  }

  detallesFiesta(nombreUsuario: string, id: number): Observable<detallesFiesta> {
    // Crear el objeto de solicitud con el ID del pedido si está disponible
    console.log("fiestaIDCS: ", id);

    return this.http.get<detallesFiesta>(
      `http://localhost:8080/api/fiestas/detallesFiesta/${id}/${nombreUsuario}`
    );
  }

  cancelarPedido(nombreUsuario: string, id: number): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/api/pedidos/cancelarPedido`, { nombreUsuario, id })
      .pipe(
        tap(response => {
          if (response) {
            console.log("Pedido cancelado:", response);
          }
        })
      );
  }

  cancelarFiesta(nombreUsuario: string, id: number): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/api/fiestas/cancelarFiesta`, { nombreUsuario, id })
      .pipe(
        tap(response => {
          if (response) {
            console.log("Pedido cancelado:", response);
          }
        })
      );
  }

  crearPedido(pedidoData: any): Observable<any> {
    return this.http.post<any>(`http://localhost:8080/api/pedidos/crearPedido`, pedidoData)
      .pipe(
        tap(response => {
          console.log("Pedido creado:", response);
          return response;
        })
      );
  }



  logout() {
    // Eliminar usuario del localStorage al cerrar sesión
    localStorage.removeItem('clienteUser'); // o adminUser
    this.currentUserSubject.next(null);
    // Redirigir al login después de cerrar sesión y recargar la página
    window.location.href = '/login';
  }


  private getUserFromLocalStorage() {
    const userJson = localStorage.getItem('clienteUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!user && !!user.token;
  }
}