import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';
import { Observable, of, catchError } from 'rxjs'; 

// Módulos de PrimeNG
import { TableModule } from 'primeng/table'; 
import { ButtonModule } from 'primeng/button';
interface PayslipDTO {
  id: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  totalRegularMinutes: number;
  totalOvertimeMinutes: number;
  netSalary: number; // Ya que BigDecimal se serializa como number
  documentPath: string; // Ruta interna, pero usamos el ID para descargar
}
@Component({
  selector: 'app-my-payslips',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DatePipe],
  templateUrl: './my-payslips.component.html',
  styleUrl: './my-payslips.component.scss'
})
export class MyPayslipsComponent implements OnInit{

  private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/api/documents'; // La ruta de documentos
    
    payslips: PayslipDTO[] = [];
    isLoading = true;
    
    ngOnInit(): void {
        this.loadPayslips();
    }

    // Carga la lista de boletas de pago del empleado logueado
    loadPayslips(): void {
        this.isLoading = true;
        this.http.get<PayslipDTO[]>(`${this.apiUrl}/payslips/me`).subscribe({
            next: (data) => {
                this.payslips = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al cargar boletas de pago:', err);
                this.isLoading = false;
                alert('No se pudieron cargar sus boletas.');
            }
        });
    }
    
    // Dispara la descarga del PDF (protegida por el Interceptor)
    downloadPayslip(documentId: number): void {
        const url = `${this.apiUrl}/${documentId}/download`;
        // La url usa el ID del documento (que es el ID de la boleta).
        window.open(url, '_blank'); 
    }
}
