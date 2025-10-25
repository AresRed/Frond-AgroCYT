import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { environment } from '../../../../Environment/environment';


interface PayslipDTO {
  id: number;
  employee: { employeeCode: string, fullName: string }; 
  payPeriodStart: string;
  payPeriodEnd: string;
  netSalary: number; 
  documentPath: string;
}
@Component({
  selector: 'app-payslip-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule, TableModule, CurrencyPipe, DatePipe],
  templateUrl: './payslip-management.component.html',
  styleUrl: './payslip-management.component.scss'
})
export class PayslipManagementComponent implements OnInit{

  private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/api/documents'; 

    // ... (Variables de generación generationForm, employees$, etc.)
    
    // Lista de boletas generadas
    generatedPayslips: PayslipDTO[] = [];
    isLoadingList = false;

    ngOnInit(): void {
        // ... (Cargar empleados)
        this.loadGeneratedPayslips(); // <-- Nueva llamada
    }

    loadGeneratedPayslips(): void {
        this.isLoadingList = true;
        // GET /api/documents/payslips/all
        this.http.get<PayslipDTO[]>(`${this.apiUrl}/payslips/all`).subscribe({
            next: (data) => {
                this.generatedPayslips = data;
                this.isLoadingList = false;
            },
            error: (err) => {
                console.error('Error al cargar boletas generadas:', err);
                this.isLoadingList = false;
            }
        });
    }

    downloadPayslip(payslipId: number): void {
        // Usa el endpoint general de descarga de documentos
        const downloadUrl = `${this.apiUrl}/${payslipId}/download`; 
        window.open(downloadUrl, '_blank');
    }
}
