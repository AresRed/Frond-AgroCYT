import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { environment } from '../../../../Environment/environment';
import { DocumentDTO } from '../../../../core/models/document.model';
import { Tag } from "primeng/tag";
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from "primeng/table";
import { FormsModule } from '@angular/forms'; // <-- 1. AGREGAR FormsModule

import { ButtonModule } from 'primeng/button'; 
import { TagModule } from 'primeng/tag'; 
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from "primeng/floatlabel";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
@Component({
  selector: 'app-document-list',
  imports: [CommonModule,
    FormsModule,
    DatePipe,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule, FloatLabel, IconField, InputIcon],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss'
})
export class DocumentListComponent implements OnInit {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/api/documents'; 

  documents: DocumentDTO[] = [];
  isLoading = false;
  globalFilter = '';

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    // Llama al nuevo endpoint
    this.http.get<DocumentDTO[]>(`${this.apiUrl}/all`) 
      .subscribe({
        next: (data) => {
          this.documents = data; 
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar documentos:', err);
          this.isLoading = false;
        }
      });
  }

  downloadDocument(documentId: number): void {
      const url = `${this.apiUrl}/${documentId}/download`;
      window.open(url, '_blank'); 
  }
}
