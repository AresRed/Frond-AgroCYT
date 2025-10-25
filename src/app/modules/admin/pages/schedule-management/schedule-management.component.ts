import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment'; 
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Módulos de PrimeNG
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Toast } from "primeng/toast";


interface WorkSchedule {
  id: number; name: string; startTime: string; endTime: string; toleranceMinutes: number;
}
interface EmployeeListDTO { id: number; fullName: string; }
interface EmployeeScheduleAssignmentDTO { employeeId: number; scheduleId: number; validFrom: string; validTo: string | null; workingDays: string; }
@Component({
  selector: 'app-schedule-management',
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, InputTextModule, Toast],
  templateUrl: './schedule-management.component.html',
  styleUrl: './schedule-management.component.scss'
})
export class ScheduleManagementComponent implements OnInit{
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/api/schedules'; 
  
  // Modelos para los formularios
  newSchedule: WorkSchedule = { id: 0, name: '', startTime: '', endTime: '', toleranceMinutes: 15 };
  assignmentForm: EmployeeScheduleAssignmentDTO = { employeeId: 0, scheduleId: 0, validFrom: '', validTo: null, workingDays: '' };

  // Datos para listas desplegables (Observable)
  schedules$!: Observable<WorkSchedule[]>;
  employees$!: Observable<EmployeeListDTO[]>;
  
  message: { type: 'success' | 'error', text: string } | null = null;
  isLoading = false;

  // 💡 Lógica de Días Laborables para los botones
  weekDays = [
    { name: 'LUN', code: 'LUN', selected: false },
    { name: 'MAR', code: 'MAR', selected: false },
    { name: 'MIÉ', code: 'MIE', selected: false },
    { name: 'JUE', code: 'JUE', selected: false },
    { name: 'VIE', code: 'VIE', selected: false },
    { name: 'SÁB', code: 'SAB', selected: false },
    { name: 'DOM', code: 'DOM', selected: false },
  ];

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    // Carga inicial de turnos y empleados
    this.schedules$ = this.http.get<WorkSchedule[]>(this.apiUrl);
    this.employees$ = this.http.get<EmployeeListDTO[]>(environment.apiUrl + '/api/employee');
  }

  // ---------------------------------------------------------------------
  // Lógica de Selección de Días
  // ---------------------------------------------------------------------
  toggleDay(day: { name: string, code: string, selected: boolean }): void {
    day.selected = !day.selected;
    this.updateWorkingDaysString();
  }

  updateWorkingDaysString(): void {
    const selectedCodes = this.weekDays
                            .filter(day => day.selected)
                            .map(day => day.code);
    // Formato de cadena separado por comas (Ej: LUN,MAR,VIE)
    this.assignmentForm.workingDays = selectedCodes.join(',');
  }

  // ---------------------------------------------------------------------
  // 1. CREAR TURNO BASE (WorkSchedule)
  // ---------------------------------------------------------------------
  createSchedule(): void {
    this.isLoading = true;
    // ... (Tu lógica existente para crear turno)
    this.http.post<WorkSchedule>(`${this.apiUrl}/turn`, this.newSchedule).pipe(
      tap(() => this.loadInitialData()) 
    ).subscribe({
      next: () => {
        this.message = { type: 'success', text: 'Turno creado con éxito!' };
        this.newSchedule = { id: 0, name: '', startTime: '', endTime: '', toleranceMinutes: 15 };
        this.isLoading = false;
      },
      error: (err) => {
        this.message = { type: 'error', text: `Error al crear turno: ${err.error.message || 'Error desconocido'}` };
        this.isLoading = false;
      }
    });
  }

  // ---------------------------------------------------------------------
  // 2. ASIGNAR TURNO A EMPLEADO (EmployeeSchedule)
  // ---------------------------------------------------------------------
  assignSchedule(): void {
    this.isLoading = true;
    this.message = null;
    
    // Validar si los días laborables están vacíos (usando la cadena TS)
    if (!this.assignmentForm.workingDays) {
        this.message = { type: 'error', text: 'Debe seleccionar al menos un día laborable.' };
        this.isLoading = false;
        return;
    }
    
    // Preparar el payload (validTo se convierte a null si está vacío)
    const payload = { 
        ...this.assignmentForm, 
        validTo: this.assignmentForm.validTo || null 
    };
    
    this.http.post(`${this.apiUrl}/assign`, payload).subscribe({
      next: () => {
        this.message = { type: 'success', text: 'Horario asignado con éxito.' };
        // Resetear el formulario y los botones de días
        this.assignmentForm = { employeeId: 0, scheduleId: 0, validFrom: '', validTo: null, workingDays: '' };
        this.weekDays.forEach(day => day.selected = false);
        this.isLoading = false;
      },
      error: (err) => {
        this.message = { type: 'error', text: `Error al asignar: ${err.error.message || 'Error desconocido'}` };
        this.isLoading = false;
      }
    });
  }
}
