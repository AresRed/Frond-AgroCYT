// Archivo: src/app/modules/admin/components/document-upload/document-upload.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment'; 

// PrimeNG Imports
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload'; // CRÍTICO: Para el input de archivo
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
interface EmployeeListDTO { id: number; fullName: string; employeeCode: string; }
@Component({
  selector: 'app-document-upload',
  standalone:true,
  imports: [CommonModule, FormsModule, DropdownModule, FileUploadModule, ButtonModule, CardModule],  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/api/documents/upload';
  private employeesUrl = environment.apiUrl + '/api/employee';

  employees: EmployeeListDTO[] = [];
  
  // Modelos de formulario
  selectedEmployeeId: number | null = null;
  documentType: string = '';
  selectedFile: File | null = null; // El archivo binario a subir

  isLoading = false;

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    // Carga la lista de empleados para el selector
    this.http.get<EmployeeListDTO[]>(this.employeesUrl).subscribe(data => {
        this.employees = data;
    }, error => console.error('Error cargando empleados para dropdown:', error));
  }

  onFileSelect(event: any): void {
    // Captura el archivo seleccionado del input
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // -------------------------------------------------------------
  // FUNCIÓN CRÍTICA: Subir el Archivo con FormData
  // -------------------------------------------------------------
  uploadDocument(): void {
    if (!this.selectedEmployeeId || !this.documentType || !this.selectedFile) {
      alert('Por favor, seleccione el empleado, el tipo de documento y el archivo.');
      return;
    }

    this.isLoading = true;

    // 1. Crear el objeto FormData (CRÍTICO para peticiones multipart)
    const formData = new FormData();

    // 2. Añadir el archivo binario
    formData.append('file', this.selectedFile);

    // 3. Añadir los metadatos como un OBJETO JSON (como String, que Spring espera en @RequestPart)
    const metadata = {
        employeeId: this.selectedEmployeeId,
        documentType: this.documentType,
        // Agrega el nombre del archivo para referencia en el backend
        fileName: this.selectedFile.name 
    };
    const metadataJsonString = JSON.stringify(metadata);
    // Convertir el JSON a String y enviarlo bajo la clave 'metadata'
    const metadataBlob = new Blob([metadataJsonString], {
      type: 'application/json' 
  });

    // 4. Llamar al endpoint POST /api/documents/upload
    this.http.post(this.apiUrl, formData).subscribe({
      next: () => {
        alert('Documento subido y asociado al empleado con éxito.');
        this.resetForm();
        this.isLoading = false;
      },
      error: (err) => {
        alert(`Fallo al subir documento: ${err.error?.message || 'Error de servidor.'}`);
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.selectedEmployeeId = null;
    this.documentType = '';
    this.selectedFile = null;
    (document.getElementById('fileInput') as HTMLInputElement).value = ''; // Limpiar input file
  }
}
