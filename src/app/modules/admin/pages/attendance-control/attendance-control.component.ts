import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Incluir DatePipe
import { FormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment'; 

// Módulos de PrimeNG
import { TableModule } from 'primeng/table'; 
import { ButtonModule } from 'primeng/button'; 
import { TagModule } from 'primeng/tag'; 
import { InputTextModule } from 'primeng/inputtext';

import { of, catchError } from 'rxjs';

interface EmployeeStatus {
  employeeId: number;
  employeeCode: string; 
  fullName: string;
  position: string;
  status: string; // 'ASISTIO', 'NO_REGISTRADO', 'SALIO'
  lastMarkTime: string | null; // Hora del último registro
  reportDate: string; 
  biometricHash: string; // CRÍTICO para el registro manual
}

@Component({
  selector: 'app-attendance-control',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, InputTextModule, DatePipe],
  templateUrl: './attendance-control.component.html',
  styleUrl: './attendance-control.component.scss'
})
export class AttendanceControlComponent implements OnInit{

  private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/api/attendance'; 

    // Inicializa la fecha a hoy en formato YYYY-MM-DD
    selectedDate: string = new Date().toISOString().split('T')[0]; 
    employeeStatuses: EmployeeStatus[] = [];
    isLoading = false;
    
    ngOnInit(): void {
        this.loadDailyStatus();
    }

    // ---------------------------------------------------------------------
    // 1. Cargar el Estado Diario (GET)
    // ---------------------------------------------------------------------
    loadDailyStatus(): void {
        this.isLoading = true;
        
        // GET /api/attendance/status/daily?date=YYYY-MM-DD
        this.http.get<EmployeeStatus[]>(`${this.apiUrl}/status/daily?date=${this.selectedDate}`).pipe(
            catchError(error => {
                console.error('Error al cargar estado diario:', error);
                this.isLoading = false;
                alert('Error al cargar datos. Verifique el token y el backend.');
                return of([]);
            })
        ).subscribe(data => {
            this.employeeStatuses = data;
            this.isLoading = false;
        });
    }
    
    // ---------------------------------------------------------------------
    // 2. Registro Manual (POST)
    // ---------------------------------------------------------------------
    registerManualMark(employeeStatus: EmployeeStatus): void {
        
        this.isLoading = true;
        
        // Determina si la próxima acción es ENTRADA o SALIDA basándose en el estado actual
        const actionText = employeeStatus.status === 'ASISTIO' ? 'Salida' : 'Entrada';
        
        // El backend determina el tipo de registro (IN/OUT) basado en el último registro.
        const payload = {
            biometricHash: employeeStatus.biometricHash, 
            deviceTimestamp: new Date().toISOString(), // Hora actual del supervisor/servidor
            latitude: 0, 
            longitude: 0, 
        };
        
        // POST /api/attendance/register (Reutiliza el endpoint de marcaje biométrico)
        this.http.post(`${this.apiUrl}/register`, payload).subscribe({
            next: () => {
                
                this.loadDailyStatus(); // Recargar la tabla para mostrar el nuevo estado
            },
            error: err => {
                console.error('Error al registrar manualmente:', err);
                alert(`Error al registrar ${actionText}: ${err.error.message || 'Error desconocido'}`);
                this.isLoading = false;
            }
        });
    }
    
    // Auxiliar para el texto del botón
    getButtonText(status: string): string {
        if (status === 'ASISTIO') return 'Marcar Salida';
        if (status === 'SALIO') return 'Jornada Finalizada'; 
        return 'Marcar Entrada';
    }
}
