import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import {  MenuModule } from "primeng/menu";
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-menu-employee',
  imports: [
    MenuModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './menu-employee.component.html',
  styleUrl: './menu-employee.component.scss'
})
export class MenuEmployeeComponent implements OnInit, OnDestroy {

  seccionActiva: string = 'my-schedule';
  menuItems: MenuItem[] = [];
  private routerSubscription: Subscription;


  constructor(private router: Router) {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.seccionActiva = event.url.split('/').pop() || 'my-schedule';
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.initializeMenuItems();
  }
  initializeMenuItems(): void {
    this.menuItems = [
      { label: 'Horarios', icon: 'pi pi-users', routerLink: ['my-schedule'], id: 'my-schedule' },
      { label: 'Certificados', icon: 'pi pi-user-plus', routerLink: ['my-certificates'], id: 'my-certificates' },
      { label: 'Asistencias', icon: 'pi pi-calendar-clock', routerLink: ['my-attendance-history'], id: 'my-attendance-history' },
      { label: 'Solicitudes', icon: 'pi pi-clock', routerLink: ['my-requests'], id: 'my-requests' },
      { label: 'Boletas', icon: 'pi pi-exclamation-triangle', routerLink: ['my-payslips'], id: 'my-payslips' },
      { label: 'Archivos y Documentos', icon: 'pi pi-folder-open', },
    ];
  }

}
