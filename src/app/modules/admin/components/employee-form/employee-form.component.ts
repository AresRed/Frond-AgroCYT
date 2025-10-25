import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../Environment/environment';
import { ButtonModule } from 'primeng/button';
import { WorkPosition } from '../../../../core/models/schedule.model';
import { catchError, Observable, of } from 'rxjs';
import { EmployeeRequestDTO } from '../../../../core/models/employee.model';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { InputGroupModule } from 'primeng/inputgroup';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';



@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, FormsModule, DialogModule, DropdownModule, InputTextModule, InputMaskModule, PasswordModule, InputGroupModule, ToastModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
  providers: [MessageService] // <-- Añadir el proveedor para el servicio de mensajes
})
export class EmployeeFormComponent {

  // Inyecciones
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private messageService = inject(MessageService); // <-- Inyectar el servicio de mensajes
  private apiUrl = environment.apiUrl + '/api/employee';
  private positionsApiUrl = environment.apiUrl + '/api/employee/positions'; // Nuevo endpoint para CRUD de Cargos

  // Output para notificar al componente padre
  @Output() employeeRegistered = new EventEmitter<void>(); 
  
  // 2. Propiedades de la Clase
  employeeForm!: FormGroup;
  isLoading = false;
  
  // Variables para la creación de cargos
  newPositionName: string = ''; 
  isCreatingPosition = false;
  showNewPositionDialog=false;

  // Catálogo de Roles y Posiciones (Data para Dropdowns)
  availableRoles = [
    { label: 'Administrador', value: 'ROLE_ADMIN' },
    { label: 'Recursos Humanos', value: 'ROLE_RRHH' },
    { label: 'Empleado', value: 'ROLE_USER' }
  ];
  workPositions$!: Observable<WorkPosition[]>; // <-- Observable para el dropdown de cargos

  // ---------------------------------------------------------------------

  constructor() {
    this.initForm();
  }

  ngOnInit(): void { // <-- Implementado OnInit para cargar datos
    this.loadWorkPositions();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      // 💡 CAMPOS DE IDENTIFICACIÓN Y CONTACTO
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      employeeCode: ['', Validators.required],
      
      // CRÍTICO: Position ahora es positionId (el ID del cargo)
      positionId: [null, Validators.required], 
      
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.maxLength(15)]], 
      
      biometricHash: ['hash-prueba-biometrico-unico-valido-999999999999999', [Validators.required, Validators.minLength(32), Validators.maxLength(64)]], 
      
      // CAMPOS DE USUARIO
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleName: ['ROLE_EMPLOYEE', Validators.required]
    });
  }
  
  // ---------------------------------------------------------------------
  // LÓGICA DE CARGA DE DATOS PARA DROPDOWN (al inicio)
  // ---------------------------------------------------------------------
  loadWorkPositions(): void {
    // 💡 GET /api/employee/positions para cargar el catálogo
    this.workPositions$ = this.http.get<WorkPosition[]>(this.positionsApiUrl).pipe(
        catchError(err => {
            console.error('Error cargando cargos:', err);
            return of([]);
        })
    );
  }

  // ---------------------------------------------------------------------
  // FUNCIÓN 1: CREAR CARGO (Llamada desde el Modal)
  // ---------------------------------------------------------------------
  createWorkPosition(): void {
      if (!this.newPositionName.trim()) {
          alert('Debe ingresar un nombre para el cargo.');
          return;
      }
      
      this.isCreatingPosition = true;
      const positionDTO: Omit<WorkPosition, 'id'> = { name: this.newPositionName }; // Payload simple
  
      this.http.post<WorkPosition>(this.positionsApiUrl, positionDTO)
          .subscribe({
              next: (newPosition) => {
                  alert(`Cargo '${newPosition.name}' creado exitosamente.`);
                  this.newPositionName = ''; 
                  this.isCreatingPosition = false;
                  // Recargar la lista de cargos para actualizar el dropdown
                  this.showNewPositionDialog = false; // Ocultar el diálogo
                  this.loadWorkPositions(); 
              },
              error: (err) => {
                  this.isCreatingPosition = false;
                  alert(`Fallo al crear el cargo. Error: ${err.error?.message || 'Ya existe.'}`);
              }
          });
  }

  // ---------------------------------------------------------------------
  // FUNCIÓN 2: ENVÍO DEL FORMULARIO PRINCIPAL
  // ---------------------------------------------------------------------
  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, complete todos los campos obligatorios.' });
      return;
    }

    this.isLoading = true;
    
    const newEmployee = this.employeeForm.value as EmployeeRequestDTO; // Usar el valor del formulario
    
    // CRÍTICO: El POST al backend
    this.http.post(this.apiUrl, newEmployee).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: '¡Empleado y cuenta creados con éxito!' });
        this.employeeForm.reset({ roleName: 'ROLE_EMPLOYEE', positionId: null }); // Resetear y dejar valores por defecto
        this.isLoading = false;
        this.employeeRegistered.emit(); // Notificar al Dashboard
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Error desconocido al crear empleado.';
        this.messageService.add({ severity: 'error', summary: 'Error de Registro', detail: msg });
        console.error('Error de registro:', err);
      }
    });
  }
}
