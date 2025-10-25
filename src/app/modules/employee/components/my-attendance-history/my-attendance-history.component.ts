import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment'; 

// Módulos de PrimeNG
import { TableModule } from 'primeng/table'; 
import { ButtonModule } from 'primeng/button'; 
import { TagModule } from 'primeng/tag'; 

import { of, catchError } from 'rxjs';
import { Router } from '@angular/router';

interface AttendanceRecord {
  reportDate: string; // Fecha (YYYY-MM-DD)
  entryTime: string | null; // Hora de entrada
  exitTime: string | null; // Hora de salida
  totalHours: number | null; // Horas trabajadas (ej: 8.5)
  status: string; // 'COMPLETO', 'PARCIAL', 'NO_ASISTIO'
}
@Component({
  selector: 'app-my-attendance-history',
  standalone: true,
  
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule],
  templateUrl: './my-attendance-history.component.html',
  styleUrl: './my-attendance-history.component.scss'
})
export class MyAttendanceHistoryComponent implements OnInit{

    private http = inject(HttpClient);
    private router = inject(Router); // <-- Inyectar Router
    private apiUrl = environment.apiUrl + '/api/reports';

    attendanceRecords: AttendanceRecord[] = [];
    isLoading = false;
    
    // Variables de filtro
    private currentDate = new Date();
    selectedMonth: number = this.currentDate.getMonth() + 1;
    selectedYear: number = this.currentDate.getFullYear();
    availableYears: number[] = this.generateYearRange();

    ngOnInit(): void {
        this.loadAttendanceHistory();
    }

    // Genera un rango de años (método auxiliar)
    generateYearRange(): number[] {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) { 
            years.push(i);
        }
        return years;
    }

    // ---------------------------------------------------------------------
    // 1. Cargar Historial (CRÍTICO: Conversión de Month/Year a Start/End Date)
    // ---------------------------------------------------------------------
    loadAttendanceHistory(): void {
        this.isLoading = true;
        
        // 💡 LÓGICA DE CÁLCULO DE FECHAS
        const date = new Date(this.selectedYear, this.selectedMonth - 1, 1); // 1er día del mes
        
        // Calcular el último día del mes
        const start = date.toISOString().split('T')[0];
        const end = new Date(this.selectedYear, this.selectedMonth, 0).toISOString().split('T')[0]; // Mes 0 es el último día del mes anterior
        
        // 2. Construir la URL con los parámetros START y END
        const url = `${this.apiUrl}/me?start=${start}&end=${end}`;
        
        this.http.get<AttendanceRecord[]>(url).pipe(
            catchError(error => {
                this.isLoading = false;
                
                // 💡 MANEJO DE ERROR 403/401: Redirigir si el token es inválido
                if (error.status === 403 || error.status === 401) {
                    alert('Sesión expirada. Por favor, vuelva a iniciar sesión.');
                    this.router.navigate(['/login']);
                }
                console.error('Error al cargar historial:', error);
                return of([]);
            })
        ).subscribe(data => {
            this.attendanceRecords = data;
            this.isLoading = false;
        });
    }

    // Auxiliar: Define el color de la etiqueta según el estado
    getSeverity(status: string): string {
        switch (status) {
            case 'COMPLETO': return 'success';
            case 'PARCIAL': return 'warning';
            case 'NO_ASISTIO': return 'danger';
            default: return 'secondary';
        }
    }

    // Auxiliar: Formatea horas decimales (ej: 8.5) a "8h 30m"
    formatTotalHours(hours: number | null): string {
        if (hours === null) return '--';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    }
}
