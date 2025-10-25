import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table'; 
import { ButtonModule } from 'primeng/button'; 
import { TagModule } from 'primeng/tag'; 
import { SkeletonModule } from 'primeng/skeleton'; // Para el estado de carga

import { of, catchError } from 'rxjs';
interface Certificate {
  id: number;
  title: string;
  type: 'EMPLEO' | 'FORMACION' | 'DIPLOMA'; 
  issueDate: string; // YYYY-MM-DD
  expiryDate: string | null; // YYYY-MM-DD (Puede ser nulo)
  downloadUrl: string; // URL simulada para descarga
}

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  // Importar módulos de PrimeNG y Angular
  imports: [CommonModule, TableModule, ButtonModule, TagModule, SkeletonModule],
  templateUrl: './my-certificates.component.html',
  styleUrl: './my-certificates.component.scss'
})
export class MyCertificatesComponent implements OnInit{

  private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/api/certificates/me'; // Endpoint seguro
    
    certificates: Certificate[] = [];
    isLoading = false;
    
    ngOnInit(): void {
        this.loadCertificates();
    }

    // ---------------------------------------------------------------------
    // 1. Cargar Certificados (GET)
    // ---------------------------------------------------------------------
    loadCertificates(): void {
        this.isLoading = true;
        
        // GET /api/certificates/me (El token JWT identifica al usuario)
        this.http.get<Certificate[]>(this.apiUrl).pipe(
            catchError(error => {
                console.error('Error al cargar certificados:', error);
                this.isLoading = false;
                alert('Error al cargar certificados. Verifique su conexión y sesión.');
                // Retornar datos mock para desarrollo si la API falla
                return of(this.getMockCertificates()); 
            })
        ).subscribe(data => {
            this.certificates = data;
            this.isLoading = false;
        });
    }

    // ---------------------------------------------------------------------
    // 2. Descargar Certificado
    // ---------------------------------------------------------------------
    downloadCertificate(certificate: Certificate): void {
        // En producción, aquí se haría la llamada al backend para obtener el blob o se abriría la URL de descarga segura.
        window.open(certificate.downloadUrl, '_blank');
        console.log(`Descargando: ${certificate.title}`);
    }
    
    // ---------------------------------------------------------------------
    // 3. Auxiliares para el Template
    // ---------------------------------------------------------------------
    // Define el color de la etiqueta según el tipo de certificado
    getSeverity(type: string): string {
        switch (type) {
            case 'EMPLEO': return 'info';
            case 'FORMACION': return 'success';
            case 'DIPLOMA': return 'warning';
            default: return 'secondary';
        }
    }

    // Comprueba si un certificado ha caducado
    isExpired(expiryDate: string | null): boolean {
        if (!expiryDate) return false;
        // Obtiene la fecha de hoy en formato YYYY-MM-DD para una comparación limpia
        const today = new Date().toISOString().split('T')[0];
        return expiryDate < today;
    }
    
    // Datos Mock para simulación
    getMockCertificates(): Certificate[] {
        return [
            { id: 1, title: 'Certificado de Empleo 2024', type: 'EMPLEO', issueDate: '2024-01-15', expiryDate: null, downloadUrl: 'https://docs.google.com/document/d/1' },
            { id: 2, title: 'Curso de Liderazgo (Válido)', type: 'FORMACION', issueDate: '2023-11-01', expiryDate: '2026-11-01', downloadUrl: 'https://docs.google.com/document/d/2' },
            { id: 3, title: 'Certificado de Seguridad (Expirado)', type: 'FORMACION', issueDate: '2022-07-20', expiryDate: '2023-07-20', downloadUrl: 'https://docs.google.com/document/d/3' },
            { id: 4, title: 'Diploma en Tareas Administrativas', type: 'DIPLOMA', issueDate: '2021-03-05', expiryDate: null, downloadUrl: 'https://docs.google.com/document/d/4' },
        ];
    }
}
