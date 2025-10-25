import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { MenuAdminComponent } from './pages/menu-admin/menu-admin.component';
import { ProfileComponent } from '../info/pages/profile/profile.component';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeFormComponent } from './components/employee-form/employee-form.component';
import { ScheduleManagementComponent } from './pages/schedule-management/schedule-management.component';
import { AttendanceControlComponent } from './pages/attendance-control/attendance-control.component';
import { RequestManagementComponent } from './pages/request-management/request-management.component';
import { DocumentListComponent } from './pages/document-list/document-list.component';


export const ADMIN_ROUTES: Routes = [
    {
        // La ruta raíz de este módulo (ej: /admin)
        path: '',
        canActivate: [authGuard], // Aplica la seguridad
        component: MenuAdminComponent, // CARGA EL LAYOUT MAESTRO
        data: { roles: ['ADMIN', 'RRHH'] }, // Solo para roles de gestión
        children: [
            { path: 'profile', component: ProfileComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'lista-empleados', component: EmployeeListComponent },
            { path: 'registrar-nuevo', component: EmployeeFormComponent },
            { path: 'asignar-horarios', component: ScheduleManagementComponent },
            { path: 'control-diario', component: AttendanceControlComponent },
            { path: 'solicitudes-pendientes', component: RequestManagementComponent },
            { path: 'archivos-documentos', component: DocumentListComponent },
        ]
    }
];