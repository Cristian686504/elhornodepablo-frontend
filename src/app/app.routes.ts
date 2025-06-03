import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { InicioComponent } from './inicio/inicio.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard, NoAuthGuard } from './service/guards/auth.guards';
import { LoginAdminComponent } from './login-admin/login-admin.component';
import { GestionComponent } from './gestion/gestion.component';
import { AuthGuardAdmin, NoAuthGuardAdmin } from './service/guards/auth-admin.guards.service';
import { TipoComponent } from './tipo/tipo.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PerfilComponent } from './perfil/perfil.component';
import { GraficaComponent } from './grafica/grafica.component';
import { PedidosAdminComponent } from './pedidos-admin/pedidos-admin.component';
import { FiestasAdminComponent } from './fiestas-admin/fiestas-admin.component';
import { FiestasComponent } from './fiestas/fiestas.component';

export const routes: Routes = [

    { path: '', component: InicioComponent, canActivate: [AuthGuard] },  // Ruta de inicio
    { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
    { path: 'admin', component: LoginAdminComponent, canActivate: [NoAuthGuardAdmin] },
    { path: 'gestion', component: GestionComponent, canActivate: [AuthGuardAdmin] },
    { path: 'tipo', component: TipoComponent, canActivate: [AuthGuard]},
    { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard] },
    { path: 'fiestas', component: FiestasComponent, canActivate: [AuthGuard] },
    { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
    { path: 'grafica', component: GraficaComponent, canActivate: [AuthGuardAdmin] },
    { path: 'pedidos-admin', component: PedidosAdminComponent, canActivate: [AuthGuardAdmin] },
    { path: 'fiestas-admin', component: FiestasAdminComponent, canActivate: [AuthGuardAdmin] },

];
