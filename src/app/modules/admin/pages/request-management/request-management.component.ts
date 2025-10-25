import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';
import { Observable, of, catchError } from 'rxjs'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🚨 NECESARIO para ngModel
// Módulos de PrimeNG
import { TableModule } from 'primeng/table'; 
import { ButtonModule } from 'primeng/button'; 
import { TagModule } from 'primeng/tag';
import { WorkPosition } from '../../../../core/models/schedule.model';
import { Card } from "primeng/card";
interface RequestResponseDTO { 
  id: number; 
  employeeId: number;
  employeeName: string; 
  requestType: string; // Ej: 'Vacaciones'
  details: string;
  startDate: string; 
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; 
}
@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, DatePipe, FormsModule],
  templateUrl: './request-management.component.html',
  styleUrl: './request-management.component.scss'
})
export class RequestManagementComponent implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  
  // URLs de API
  private requestApiUrl = environment.apiUrl + '/api/requests'; 
  private positionsApiUrl = environment.apiUrl + '/api/positions'; // Nuevo endpoint

  // Estado de Solicitudes
  requests: RequestResponseDTO[] = [];
  isLoading = true;

  // Estado de Creación de Cargo
  newPositionName: string = ''; // 🚨 Nueva variable para el nombre del cargo
  isCreatingPosition = false;

  ngOnInit(): void {
    this.loadRequests();
  }

  // ... (loadRequests y updateStatus permanecen igual)

  // ---------------------------------------------------------------------
  // 🚨 NUEVO MÉTODO: CREAR CARGO
  // ---------------------------------------------------------------------
  

  // Métodos loadRequests y updateStatus de tu código original:
  loadRequests(): void {
    this.isLoading = true;
    
    // GET /api/requests (Endpoint para Admin/RRHH para ver todas las solicitudes)
    this.http.get<RequestResponseDTO[]>(this.requestApiUrl)
      .pipe(
        catchError(error => {
          console.error('Error al cargar solicitudes:', error);
          this.isLoading = false;
          if (error.status === 403 || error.status === 401) {
            this.router.navigate(['/login']); 
          }
          return of([]);
        })
      )
      .subscribe(data => {
          this.requests = data;
          this.isLoading = false;
      });
  }

  updateStatus(requestId: number, status: 'APPROVED' | 'REJECTED'): void {
    
    // Solicitar un comentario al supervisor
    const comment = prompt(`Ingrese un comentario para la solicitud #${requestId} (${status}):`);
    if (comment === null) return; 

    const statusDTO = { status: status, comment: comment };
    
    // Llama al PUT /api/requests/{id}/status
    this.http.put<RequestResponseDTO>(`${this.requestApiUrl}/${requestId}/status`, statusDTO)
      .subscribe({
        next: (updatedRequest) => {
          alert(`Solicitud #${requestId} ha sido ${updatedRequest.status}.`);
          
          // Actualiza el array localmente para reflejar el cambio en la UI
          const index = this.requests.findIndex(r => r.id === requestId);
          if (index !== -1) {
            this.requests[index] = updatedRequest; // Reemplaza el objeto antiguo por el nuevo
          }
        },
        error: (err) => {
          alert(`Fallo al actualizar. Error: ${err.error.message || 'Error desconocido'}`);
        }
      });
  }
}