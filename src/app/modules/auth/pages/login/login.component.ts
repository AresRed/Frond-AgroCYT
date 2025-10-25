import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../Environment/environment';

// Módulos de PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';

// 1. Interfaz para el DTO de respuesta (Token JWT)
interface AuthResponse {
  token: string;
  role: 'ADMIN' | 'RRHH' | 'EMPLOYEE';
}
interface LoginRequest { username: string; password: string; }

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FloatLabelModule, PasswordModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  // Inyección de servicios (moderna)
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading: boolean = false;
  
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false; // Renombrado de isLoading a loading para coincidir con el HTML
  private authSubscription!: Subscription;

  ngOnInit(): void {
    // Inicializar el Formulario Reactivo
    this.initForm();
    // Verificar si ya está logueado para redirección automática
    if (this.authService.isLoggedIn()) {
      this.redirectToPanel();
    }
  }

  // Definición de los controles y sus validadores
  initForm(): void {
    this.loginForm = this.fb.group({
      // Los nombres de control deben coincidir con el HTML ajustado
      username: ['', [Validators.required, Validators.minLength(3)]], 
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Método requerido por el HTML: (ngSubmit)="onSubmit()"
  onSubmit(): void {
    // 1. Validación del formulario local
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Por favor, ingresa credenciales válidas.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    
    // 2. Llamar al servicio de login con los datos del formulario
    const credentials = this.loginForm.value as { username: string; password: string; };

    this.authSubscription = this.authService.login(credentials).subscribe({
      next: () => {
        // 3. Éxito: Redirigir según el rol.
        this.redirectToPanel(); 
      },
      error: (err) => {
        // 4. Error: Mostrar mensaje y detener el loader
        this.loading = false;
        // La validación 401/403 significa credenciales incorrectas
        this.errorMessage = 'Credenciales inválidas. Verifica tu usuario y contraseña.';
        console.error('Error de Login:', err);
      }
    });
  }

  // Método requerido por el HTML: (click)="contrasena()"
  contrasena(): void {
     this.router.navigate(['/recover-password']); 
  }

  // Lógica de redirección basada en el rol
  redirectToPanel(): void {
    const role = this.authService.getUserRole();
    
    // Redirección basada en roles
    if (role === 'ADMIN' || role === 'RRHH') { // Los roles de gestión van al dashboard de admin
      this.router.navigate(['/admin']); 
    } else if (role === 'EMPLOYEE') {
      this.router.navigate(['/employee']); // El empleado va a su dashboard de empleado
    } else {
      // Si por alguna razón no hay rol, lo mejor es volver al login.
      this.router.navigate(['/login']);
    }
    this.loading = false;
  }

  ngOnDestroy(): void {
    // Limpieza de suscripciones
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
