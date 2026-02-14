import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="p-2">
      <a class="sidebar-link" routerLink="/dashboard/home" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-speedometer2"></i>Tablero</a>
      <a class="sidebar-link" routerLink="/dashboard/crm" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-people"></i>CRM</a>
      <a class="sidebar-link" routerLink="/dashboard/cotizaciones" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-file-earmark-text"></i>Cotizaciones</a>
      <a class="sidebar-link" routerLink="/dashboard/pedidos" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-cart-check"></i>Pedidos</a>
      <a class="sidebar-link" routerLink="/dashboard/inventario" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-box-seam"></i>Inventario</a>
      <a class="sidebar-link" routerLink="/dashboard/despachos" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-truck"></i>Despachos</a>
      <a class="sidebar-link" routerLink="/dashboard/devoluciones" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-arrow-return-left"></i>Devoluciones</a>
      @if (auth.hasRole('MASTER')) {
        <a class="sidebar-link" routerLink="/dashboard/reportes" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-bar-chart"></i>Reportes</a>
        <a class="sidebar-link" routerLink="/dashboard/integraciones" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-diagram-3"></i>Integraciones</a>
        <a class="sidebar-link" routerLink="/dashboard/auditoria" routerLinkActive="active" (click)="navigate.emit()"><i class="bi bi-shield-lock"></i>Auditoría</a>
      }
    </div>
  `
})
export class SidenavComponent {
  @Output() navigate = new EventEmitter<void>();
  constructor(public readonly auth: AuthService) {}
}
