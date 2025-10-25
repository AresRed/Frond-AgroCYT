import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../Environment/environment';
import { of, catchError, map } from 'rxjs';

import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
// Módulos de PrimeNG (Importar aquí)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { Skeleton } from "primeng/skeleton";
import { FloatLabel } from "primeng/floatlabel";

interface EmployeeListDTO {
  id: number; employeeCode: string; fullName: string; position: string;
  userId: number; username: string; roleName: string;
}
interface EmployeeVM extends EmployeeListDTO {
  roleDisplay: string;
}
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    IconFieldModule,
    InputIconModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    Skeleton,
    MultiSelectModule,
    FloatLabel
],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})


export class EmployeeListComponent implements OnInit {

  private http = inject(HttpClient);
  public router = inject(Router);
  private apiUrl = environment.apiUrl + '/api/employee';
  employees: EmployeeVM[] = [];
  allEmployees: EmployeeVM[] = []; // Guarda la lista original sin filtrar
  isLoading = true;
  errorMessage: string | null = null;
  newPositionName: string = '';
  showNewPositionModal: boolean = false;

  // Estado de los filtros
  searchTerm: string = '';
  selectedRoles: string[] = [];

  roles = [
    { name: 'Administrador', value: 'ROLE_ADMIN' },
    { name: 'Recursos Humanos', value: 'ROLE_RRHH' },
    { name: 'Empleado', value: 'ROLE_USER' } // O el rol que corresponda
  ];

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<EmployeeListDTO[]>(this.apiUrl)
      .pipe(
        // 🚨 SOLUCIÓN AL ERROR: Usamos llaves y 'return' explícitos
        map((employeesDTO: EmployeeListDTO[]) => {
          // Mapeamos el array interno, creando el campo roleDisplay
          return employeesDTO.map(emp => ({
            ...emp,
            // Crea el campo 'roleDisplay' eliminando el prefijo 'ROLE_'
            roleDisplay: emp.roleName ? emp.roleName.slice(5) : 'N/A'
          })) as EmployeeVM[]; // Forzamos el casteo al tipo de array final (EmployeeVM[])
        }), // <-- El map de RxJS termina aquí

        catchError(error => {
          this.isLoading = false;
          if (error.status === 403 || error.status === 401) {
            this.router.navigate(['/login']);
          }
          this.errorMessage = 'Error al cargar empleados: Acceso denegado.';
          return of([]);
        })
      )
      .subscribe(data => {
        this.allEmployees = data; // Guarda la lista completa
        this.employees = data;    // Inicializa la lista a mostrar
        this.isLoading = false;
      });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.applyFilters();
  }

  onFilterByRole(event: any): void {
    // event.value es un array de los objetos de rol seleccionados
    this.selectedRoles = event.value.map((role: { name: string, value: string }) => role.value);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filteredEmployees = [...this.allEmployees];

    // 1. Filtrar por término de búsqueda
    if (this.searchTerm) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.fullName.toLowerCase().includes(this.searchTerm) ||
        emp.position.toLowerCase().includes(this.searchTerm) ||
        emp.username.toLowerCase().includes(this.searchTerm)
      );
    }

    // 2. Filtrar por roles seleccionados
    if (this.selectedRoles.length > 0) {
      filteredEmployees = filteredEmployees.filter(emp =>
        this.selectedRoles.includes(emp.roleName)
      );
    }

    this.employees = filteredEmployees;
  }
}
