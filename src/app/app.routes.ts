import { Routes } from '@angular/router';
import { AuditComponent } from './features/audit/audit.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RoleSelectorComponent } from './features/auth/role-selector/role-selector.component';
import { CrmComponent } from './features/crm/crm.component';
import { DashboardHomeComponent } from './features/dashboard-home/dashboard-home.component';
import { IntegrationsComponent } from './features/integrations/integrations.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { OrdersComponent } from './features/orders/orders.component';
import { QuotesCreateComponent } from './features/quotes/quotes-create.component';
import { QuotesComponent } from './features/quotes/quotes.component';
import { ReportsComponent } from './features/reports/reports.component';
import { ReturnsComponent } from './features/returns/returns.component';
import { ShipmentsComponent } from './features/shipments/shipments.component';
import { ShipmentDetailComponent } from './features/shipments/shipment-detail.component';
import { authGuard } from './core/guards/auth.guard';
import { dashboardEntryGuard } from './core/guards/dashboard-entry.guard';
import { roleGuard } from './core/guards/role.guard';
import { DashboardLayoutComponent } from './core/layout/dashboard-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/selector-rol' },
  {
    path: 'auth',
    children: [
      { path: 'selector-rol', component: RoleSelectorComponent },
      { path: 'login', component: LoginComponent },
      { path: '**', redirectTo: 'selector-rol' }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: DashboardHomeComponent },
      { path: 'tablero', redirectTo: 'home' },
      { path: 'crm', component: CrmComponent, canActivate: [dashboardEntryGuard] },
      { path: 'crm/:customerId', component: CrmComponent, canActivate: [dashboardEntryGuard] },
      { path: 'cotizaciones', component: QuotesComponent, canActivate: [dashboardEntryGuard] },
      { path: 'cotizaciones/nueva', component: QuotesCreateComponent, canActivate: [dashboardEntryGuard] },
      { path: 'cotizaciones/:quoteId', component: QuotesComponent, canActivate: [dashboardEntryGuard] },
      { path: 'pedidos', component: OrdersComponent, canActivate: [dashboardEntryGuard] },
      { path: 'pedidos/:orderId', component: OrdersComponent, canActivate: [dashboardEntryGuard] },
      { path: 'inventario', component: InventoryComponent, canActivate: [dashboardEntryGuard] },
      { path: 'despachos', component: ShipmentsComponent, canActivate: [dashboardEntryGuard] },
      { path: 'despachos/:shipmentId', component: ShipmentDetailComponent, canActivate: [dashboardEntryGuard] },
      { path: 'devoluciones', component: ReturnsComponent, canActivate: [dashboardEntryGuard] },
      { path: 'devoluciones/:returnId', component: ReturnsComponent, canActivate: [dashboardEntryGuard] },
      { path: 'reportes', component: ReportsComponent, canActivate: [dashboardEntryGuard] },
      { path: 'integraciones', component: IntegrationsComponent, canActivate: [dashboardEntryGuard] },
      { path: 'auditoria', component: AuditComponent, canActivate: [dashboardEntryGuard, roleGuard], data: { role: 'MASTER' } },
      { path: '**', redirectTo: 'home' }
    ]
  },
  { path: '**', redirectTo: 'dashboard/home' }
];
