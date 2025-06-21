import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Definimos una interfaz para la respuesta de autenticación
interface AuthResponse {
  token: string;
  nombreUsuario: string;

}

interface Pedido {
  id: number;
  fechaEntrega: Date;
  entrega: boolean;
  metodoPago: string;
  estado: string;
  periodicidad: string;
  direccion: string;
  motivoBeneficio: string;
  agencia: string;
  fechaPedido: Date;
  cliente: cliente;
  precio: number;
  pizzas: PizzaPedido[];
}

interface PizzaPedido {
  nombre: string;
  tipo: string;
  precio: number;
  cantidad: number;
  ingredientes: getIngredientes[];
}

interface getAdministradores {
  id: number;
  nombreUsuario: string;
  contrasenia: string;
  cedula: string;
  nombreCompleto: string;
}


interface Pizza {
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
  imagen: string;
  ingredientes: getPizzaIngrediente[];
}

interface getPizzaIngrediente {
  id: number;
  cantidad: number;
  ingrediente: getIngredientes;
}


  interface getIngredientes{
    id: number;
    nombre: string;
    cantidad : number;
    unidad_medida: string;
    gusto: boolean;
  }

interface cliente {
  id: number;
  nombreUsuario: string;
  contrasenia: string;
  nombreCompleto: string;
}

interface Fiestas {
  id: number;
  hamburguesa: boolean;
  chivito: boolean;
  cantidadPersonas: number;
  fechaFiesta: Date;
  horaServir: Date;
  precio: number;
  pago: string;
  estado: string;
  direccion: string;
  cliente: cliente;
  pizzas: fiestapizza[];
}

interface fiestapizza {
  id: number;
  cantidad: number;
  pizza: Pizza;
}





@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  // Actualiza la URL para que apunte a nuestra nueva API de autenticación
  private API_URL = 'http://localhost:8080/api/administradores/';

  private API_URL_INGREDIENTES = 'http://localhost:8080/api/ingredientes/';

  private API_URL_PIZZAS = 'http://localhost:8080/api/pizza/';

  private API_URL_FIESTA = 'http://localhost:8080/api/fiestas/';

  private API_URL_PEDIDOS = 'http://localhost:8080/api/pedidos/';



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

  getIngredientesUsados(anio: string, ingrediente: string): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`http://localhost:8080/api/ingredientes/getIngredientesUsados/${anio}/${ingrediente}`
    );
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

  getAdministradores(): Observable<{ administradores: getAdministradores[] }> {
    return this.http.get<{ administradores: getAdministradores[] }>(`${this.API_URL}getAdministradores`);
  }

  getAdministradoresPaginados(page: number, size: number): Observable<{
    content: getAdministradores[];
    totalElements: number;
    totalPages: number;
    number: number;
  }> {
    return this.http.get<{
      content: getAdministradores[];
      totalElements: number;
      totalPages: number;
      number: number;
    }>(`${this.API_URL}getAdministradoresPaginados?page=${page}&size=${size}`);
  }

  registrar(usuario: any): Observable<string> {
    return this.http.post<string>(`http://localhost:8080/api/clientes/register`, usuario,
      { responseType: 'text' as 'json' });
  }

  eliminarAdministrador(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}eliminar/${id}`, {
      responseType: 'text' as 'json'
    });
  }

  crearAdministrador(adminData: any): Observable<string> {
    return this.http.post<string>(`${this.API_URL}crear`, adminData, {
      responseType: 'text' as 'json'
    });
  }

  actualizarAdministrador(id: number, datosAdministrador: getAdministradores): Observable<any> {
    return this.http.put<any>(`${this.API_URL}${id}`, datosAdministrador, { responseType: 'text' as 'json' }).pipe(
      tap(response => {
        if (response) {
          const currentUser = this.getUserFromLocalStorage();
          if (currentUser && currentUser.nombreUsuario === datosAdministrador.nombreUsuario) {
            currentUser.nombreUsuario = datosAdministrador.nombreUsuario;
            localStorage.setItem('adminUser', JSON.stringify(currentUser));
            this.currentUserSubject.next(currentUser);
          }
        }
      })
    );
  }


  /*Ingredientes*/
  getIngredientes(): Observable<{ ingrediente: getIngredientes[] }> {
    return this.http.get<{ ingrediente: getIngredientes[] }>(`${this.API_URL_INGREDIENTES}getIngredientes`);
  }

  crearIngrediente(ingredienteData: any): Observable<string> {
    return this.http.post<string>(`${this.API_URL_INGREDIENTES}crear`, ingredienteData, {
      responseType: 'text' as 'json'
    });
  }

  actualizarIngrediente(id: number, ingredienteData: any): Observable<string> {
    return this.http.put<string>(`${this.API_URL_INGREDIENTES}actualizar/${id}`, ingredienteData, {
      responseType: 'text' as 'json'
    }).pipe(
      tap(response => {

        console.log('Ingrediente actualizado:', response);
      })
    );
  }


  eliminarIngrediente(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL_INGREDIENTES}eliminar/${id}`, {
      responseType: 'text' as 'json'
    });
  }

  getPizzas(): Observable<{ pizza: Pizza[] }> {
    return this.http.get<{ pizza: Pizza[] }>(`${this.API_URL_PIZZAS}getPizzas`);
  }

  crearPizza(pizzaData: any): Observable<string> {
    return this.http.post<string>(`${this.API_URL_PIZZAS}crear`, pizzaData, {
      responseType: 'text' as 'json'
    });
  }

  actualizarPizza(id: number, pizzaData: any): Observable<string> {
    return this.http.put<string>(`${this.API_URL_PIZZAS}modificar/${id}`, pizzaData, {
      responseType: 'text' as 'json'
    }).pipe(
      tap(response => {
        console.log('Pizza actualizada:', response);
      })
    );
  }

  eliminarPizza(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL_PIZZAS}eliminar/${id}`, {
      responseType: 'text' as 'json'
    });
  }


  getFiestas(): Observable<{ fiesta: Fiestas[] }> {
    return this.http.get<{ fiesta: Fiestas[] }>(`${this.API_URL_FIESTA}getFiestas`);
  }

  getFiestasPaginadas(page: number, size: number): Observable<{
    content: Fiestas[];
    totalElements: number;
    totalPages: number;
    number: number;
  }> {
    return this.http.get<{
      content: Fiestas[];
      totalElements: number;
      totalPages: number;
      number: number;
    }>(`${this.API_URL_FIESTA}getFiestasPaginadas?page=${page}&size=${size}`);
  }

  crearFiesta(fiestaData: any): Observable<string> {
    return this.http.post<string>(`${this.API_URL_FIESTA}crear`, fiestaData, {
      responseType: 'text' as 'json'
    });
  }

  getAnioGrafica(): Observable<{ anios: string[] }> {
    return this.http.get<{ anios: string[] }>(`${this.API_URL_INGREDIENTES}getAnioGrafica`);
  }


  getIngresos(anio: string): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`http://localhost:8080/api/ingredientes/getIngreso/${anio}`
    );
  }

  actualizarFiesta(id: number, fiestaData: any): Observable<string> {
    return this.http.put<string>(`${this.API_URL_FIESTA}modificar/${id}`, fiestaData, {
      responseType: 'text' as 'json'
    }).pipe(
      tap(response => {
        console.log('Fiesta actualizada:', response);
      })
    );
  }

  eliminarFiesta(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL_FIESTA}eliminar/${id}`, {
      responseType: 'text' as 'json'
    });
  }

  getPedidos(page: number, size: number): Observable<{
    content: Pedido[];
    totalElements: number;
    totalPages: number;
    number: number;
  }> {
    return this.http.get<{
      content: Pedido[];
      totalElements: number;
      totalPages: number;
      number: number;
    }>(`${this.API_URL_PEDIDOS}getPedidos?page=${page}&size=${size}`);
  }

  crearPedido(pedidoData: any): Observable<string> {
    return this.http.post<string>(`${this.API_URL_PEDIDOS}crear`, pedidoData, {
      responseType: 'text' as 'json'
    });
  }

  crearPedidoAdmin(pedido: any): Observable<string> {
    return this.http.post<string>(`${this.API_URL_PEDIDOS}crearPedidosAdmin`, pedido, {
      responseType: 'text' as 'json'
    });
  }

  modificarPedido(id: number, pedido: any): Observable<string> {
    return this.http.put<string>(`${this.API_URL_PEDIDOS}modificarPedido/${id}`, pedido, {
      responseType: 'text' as 'json'
    });
  }

  eliminarPedido(id: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL_PEDIDOS}eliminarPedido/${id}`, {
      responseType: 'text' as 'json'
    });
  }

  getTodosLosPedidos(): Observable<{ pedido: Pedido[] }> {
    return this.http.get<{ pedido: Pedido[] }>(`${this.API_URL_PEDIDOS}getPedidos`);
  }

  cancelarFiesta(id: number, nombreUsuario: string): Observable<void> {
  const body = {
    id: id,
    nombreUsuario: nombreUsuario
  };

  return this.http.put<void>(`${this.API_URL_FIESTA}cancelarFiesta`, body);
}

aceptarFiesta(id: number, nombreUsuario: string): Observable<void> {
  const body = {
    id: id,
    nombreUsuario: nombreUsuario
  };

  return this.http.put<void>(`${this.API_URL_FIESTA}aceptarFiesta`, body);
}

aceptarPedidoAdmin(id: number): Observable<string> {
  return this.http.put<string>(`${this.API_URL_PEDIDOS}aceptarPedidoAdmin/${id}`, {}, {
    responseType: 'text' as 'json'
  });
}

cancelarPedidoAdmin(id: number): Observable<string> {
  return this.http.put<string>(`${this.API_URL_PEDIDOS}cancelarPedidoAdmin/${id}`, {}, {
    responseType: 'text' as 'json'
  });
}


}