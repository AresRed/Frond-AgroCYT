import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment'; 

// Módulos de PrimeNG
import { TableModule } from 'primeng/table'; 
import { ButtonModule } from 'primeng/button'; 
import { CardModule } from 'primeng/card'; // Para el contenedor
import { SkeletonModule } from 'primeng/skeleton'; // Para el estado de carga

import { of, catchError } from 'rxjs';

interface Shift {
  dayOfWeek: string; // Lunes, Martes, Miércoles, etc.
  startTime: string; // Ej: "07:00"
  endTime: string;   // Ej: "16:00"
  breakDuration: string; // Ej: "1h 00m"
  taskDescription: string; // Tarea asignada para el turno
}

// Interfaz para el horario semanal (la respuesta del backend)
interface WeeklySchedule {
  weekStart: string; // Fecha de inicio de la semana (YYYY-MM-DD)
  shifts: Shift[]; // Lista de turnos para esa semana
}
@Component({
  selector: 'app-my-schedule',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CardModule, SkeletonModule],
  templateUrl: './my-schedule.component.html',
  styleUrl: './my-schedule.component.scss'
})
export class MyScheduleComponent implements OnInit{

  private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/api/schedules/me/weekly'; // Endpoint para el horario del empleado
    
    currentSchedule: WeeklySchedule | null = null;
    isLoading = false;
    
    // Variables de navegación semanal (para seleccionar semana anterior/siguiente)
    currentWeekStart: string = this.getStartOfWeek(new Date()); 
    
    ngOnInit(): void {
        this.loadWeeklySchedule();
    }
    
    // ---------------------------------------------------------------------
    // 1. Funciones de Navegación Semanal
    // ---------------------------------------------------------------------
    
    // Calcula el inicio de la semana (Lunes) para una fecha dada
    private getStartOfWeek(date: Date): string {
        const d = new Date(date);
        const day = d.getDay();
        // Ajusta la fecha al lunes (0=domingo, 1=lunes, ..., 6=sábado)
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    }
    
    // Cambia la semana (n puede ser -7 o +7)
    changeWeek(days: number): void {
        const current = new Date(this.currentWeekStart);
        current.setDate(current.getDate() + days);
        this.currentWeekStart = this.getStartOfWeek(current);
        this.loadWeeklySchedule();
    }

    // ---------------------------------------------------------------------
    // 2. Cargar Horario (GET)
    // ---------------------------------------------------------------------
    loadWeeklySchedule(): void {
        this.isLoading = true;
        
        // GET /api/schedule/me/weekly?date=YYYY-MM-DD (usando la fecha de inicio de semana)
        const url = `${this.apiUrl}?date=${this.currentWeekStart}`;
        
        this.http.get<WeeklySchedule>(url).pipe(
            catchError(error => {
                console.error('Error al cargar horario:', error);
                this.isLoading = false;
                alert('Error al cargar su horario. Verifique su conexión.');
                // Retornar datos mock en caso de fallo
                return of(this.getMockSchedule(this.currentWeekStart)); 
            })
        ).subscribe(data => {
            this.currentSchedule = data;
            this.isLoading = false;
        });
    }

    // Datos Mock para simulación (solo para desarrollo)
    private getMockSchedule(weekStart: string): WeeklySchedule {
        return {
            weekStart: weekStart,
            shifts: [
                { dayOfWeek: 'LUNES', startTime: '07:00', endTime: '16:00', breakDuration: '1h 00m', taskDescription: 'Cosecha de Uva' },
                { dayOfWeek: 'MARTES', startTime: '07:00', endTime: '16:00', breakDuration: '1h 00m', taskDescription: 'Cosecha de Uva' },
                { dayOfWeek: 'MIÉRCOLES', startTime: '08:00', endTime: '17:00', breakDuration: '1h 00m', taskDescription: 'Mantenimiento de Riego' },
                { dayOfWeek: 'JUEVES', startTime: '08:00', endTime: '17:00', breakDuration: '1h 00m', taskDescription: 'Mantenimiento de Riego' },
                { dayOfWeek: 'VIERNES', startTime: '07:00', endTime: '15:00', breakDuration: '0h 30m', taskDescription: 'Limpieza de Campo' },
                { dayOfWeek: 'SÁBADO', startTime: '--', endTime: '--', breakDuration: '--', taskDescription: 'Día Libre' },
                { dayOfWeek: 'DOMINGO', startTime: '--', endTime: '--', breakDuration: '--', taskDescription: 'Día Libre' },
            ]
        };
    }
}
