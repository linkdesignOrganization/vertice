import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CustomerProfileModalService } from './core/services/customer-profile-modal.service';
import { OrderDetailModalService } from './core/services/order-detail-modal.service';
import { RuleEngineService } from './core/services/rule-engine.service';
import { SessionStoreService } from './core/services/session-store.service';
import { UiFeedbackService } from './core/services/ui-feedback.service';
import { AuthService } from './core/services/auth.service';
import { UserMenuModalService } from './core/services/user-menu-modal.service';
import { StatusChipComponent } from './shared/components/status-chip/status-chip.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LoginRole, OrderStatus, Quote, Shipment } from './core/models/entities';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, StatusChipComponent, CurrencyPipe, DatePipe],
  standalone: true,
  styles: [
    '.global-customer-overlay { position: fixed; inset: 0; z-index: 12000; display: flex; align-items: center; justify-content: center; padding: 1rem; }',
    '.global-customer-backdrop { position: fixed; inset: 0; background: rgba(8,12,20,.64); backdrop-filter: blur(2px); }',
    '.global-customer-dialog { position: relative; z-index: 12001; width: min(820px, 96vw); }',
    '.global-customer-card { background: #ffffff !important; border-radius: 1rem; padding: 1.1rem 1.1rem .85rem; box-shadow: 0 22px 46px rgba(0,0,0,.28); }',
    '.profile-row { display: flex; justify-content: space-between; align-items: center; gap: .75rem; padding: .72rem .45rem; border-bottom: 1px solid rgba(120,140,175,.24); }',
    '.profile-row:last-child { border-bottom: 0; }',
    '.profile-value { text-align: right; font-weight: 600; }',
    '.profile-email { display: inline-block; }',
    '.profile-copy { padding: 0 .35rem; }',
    '.global-order-overlay { position: fixed; inset: 0; z-index: 12020; display: flex; align-items: center; justify-content: center; padding: 1rem; }',
    '.global-order-backdrop { position: fixed; inset: 0; background: rgba(8,12,20,.64); backdrop-filter: blur(2px); }',
    '.global-order-dialog { position: relative; z-index: 12021; width: min(860px, 97vw); }',
    '.global-order-card { background: #fff !important; border-radius: 1rem; padding: 1rem; box-shadow: 0 24px 50px rgba(0,0,0,.3); max-height: min(90dvh, 900px); display: flex; flex-direction: column; overflow: hidden; }',
    '.global-order-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }',
    '.order-row { display: flex; justify-content: space-between; align-items: center; gap: .75rem; padding: .55rem .2rem; border-bottom: 1px solid rgba(120,140,175,.24); }',
    '.order-row:last-child { border-bottom: 0; }',
    '.customer-mini { font-size: .84rem; }',
    '.global-user-overlay { position: fixed; inset: 0; z-index: 12040; display: flex; align-items: flex-start; justify-content: flex-end; padding: 4.1rem 1rem 1rem; }',
    '.global-user-backdrop { position: fixed; inset: 0; background: rgba(8,12,20,.36); }',
    '.global-user-dialog { position: relative; z-index: 12041; width: min(320px, 95vw); }',
    '.global-user-card { background: #fff !important; border-radius: .9rem; border: 1px solid rgba(120,140,175,.28); padding: .5rem; box-shadow: 0 18px 38px rgba(0,0,0,.26); }',
    '@media (max-width: 767px) { .profile-email { overflow-wrap: anywhere; word-break: break-word; max-width: 55vw; text-align: right; } .global-order-overlay { padding: .6rem; } .global-order-card { max-height: calc(100dvh - 1.2rem); } }'
  ],
  template: `
    <router-outlet />
    <app-toast-container />

    @if (userMenu.isOpen) {
      <div class="global-user-overlay" tabindex="-1" role="dialog" aria-modal="true">
        <div class="global-user-backdrop" (click)="userMenu.close()"></div>
        <div class="global-user-dialog">
          <div class="global-user-card">
            <div class="px-2 py-1 mb-1 border-bottom">
              <div class="fw-semibold"><i class="bi bi-person-circle me-1"></i>{{ store.snapshot.currentUser?.displayName }}</div>
              <small class="text-secondary">{{ roleLabel(store.snapshot.currentUser?.loginRole) }}</small>
            </div>
            @if (store.snapshot.currentUser?.loginRole === 'MASTER') {
              <button class="btn btn-light w-100 text-start mb-1" (click)="switchUserRole('OPERADOR')"><i class="bi bi-arrow-repeat me-2"></i>Cambiar a Operador</button>
            } @else {
              <button class="btn btn-light w-100 text-start mb-1" (click)="switchUserRole('MASTER')"><i class="bi bi-arrow-repeat me-2"></i>Cambiar a Gerencia</button>
            }
            <button class="btn btn-outline-danger w-100 text-start" (click)="logoutFromUserMenu()"><i class="bi bi-box-arrow-right me-2"></i>Salir</button>
          </div>
        </div>
      </div>
    }

    @if (profileModal.current; as customer) {
      <div class="global-customer-overlay" tabindex="-1" role="dialog" aria-modal="true">
        <div class="global-customer-backdrop" (click)="profileModal.close()"></div>
        <div class="global-customer-dialog">
          <div class="global-customer-card">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h4 class="mb-0"><i class="bi bi-person-vcard me-1"></i>Ficha del cliente</h4>
              <button type="button" class="btn btn-dark btn-sm" (click)="profileModal.close()">Cerrar</button>
            </div>
            <div class="small">
              <div class="profile-row">
                <span>Empresa</span>
                <div class="profile-value">
                  {{ customer.legalName }}
                  <button class="btn btn-sm btn-link profile-copy" (click)="copy(customer.legalName)"><i class="bi bi-copy"></i></button>
                </div>
              </div>
              <div class="profile-row">
                <span>Correo empresa</span>
                <div class="profile-value">
                  <span class="profile-email">{{ customer.companyEmail }}</span>
                  <button class="btn btn-sm btn-link profile-copy" (click)="copy(customer.companyEmail)"><i class="bi bi-copy"></i></button>
                </div>
              </div>
              <div class="profile-row">
                <span>Contacto</span>
                <div class="profile-value">
                  {{ customer.contactName }}
                  <button class="btn btn-sm btn-link profile-copy" (click)="copy(customer.contactName)"><i class="bi bi-copy"></i></button>
                </div>
              </div>
              <div class="profile-row">
                <span>Puesto</span>
                <div class="profile-value">
                  {{ customer.contactPosition }}
                  <button class="btn btn-sm btn-link profile-copy" (click)="copy(customer.contactPosition)"><i class="bi bi-copy"></i></button>
                </div>
              </div>
              <div class="profile-row"><span>Lista de precios</span><div class="profile-value">{{ customer.priceList }}</div></div>
              <div class="profile-row"><span>Término de pago</span><div class="profile-value">{{ customer.paymentTerm }}</div></div>
              <div class="profile-row"><span>Impuesto</span><div class="profile-value">{{ customer.taxPct }}%</div></div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (selectedOrder; as order) {
      <div class="global-order-overlay" tabindex="-1" role="dialog" aria-modal="true">
        <div class="global-order-backdrop" (click)="orderModal.close()"></div>
        <div class="global-order-dialog" (click)="$event.stopPropagation()">
          <div class="global-order-card">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="mb-0"><i class="bi bi-receipt-cutoff me-1"></i>Detalle de pedido {{ order.id }}</h4>
              <button class="btn btn-dark btn-sm" (click)="orderModal.close()">Cerrar</button>
            </div>

            <div class="global-order-body">
            <div class="row g-3">
              <div class="col-lg-6">
                <div class="border rounded p-3 h-100">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="fw-bold mb-0">Pedido</h6>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-danger" [disabled]="!selectedOrderQuote" (click)="simulateQuoteDownload('PDF')"><i class="bi bi-file-earmark-pdf"></i></button>
                      <button class="btn btn-sm btn-outline-primary" [disabled]="!selectedOrderQuote" (click)="simulateQuoteDownload('DOC')"><i class="bi bi-file-earmark-word"></i></button>
                    </div>
                  </div>
                  <div class="order-row"><span>Estado</span><app-status-chip [status]="order.status" /></div>
                  <div class="order-row"><span>Promesa</span><strong>{{ order.promisedAt | date: 'd/M/y h:mm a' }}</strong></div>
                  <div class="order-row"><span>Total</span><strong>{{ order.totalUSD | currency: 'USD' }}</strong></div>
                  <div class="order-row"><span>Facturación</span><strong>{{ order.invoiceSimulatedAt ? (order.invoiceSimulatedAt | date:'d/M/y h:mm a') : 'Pendiente' }}</strong></div>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="border rounded p-3 h-100 customer-mini">
                  <h6 class="fw-bold mb-2">Cotización y Cliente</h6>
                  <div class="order-row">
                    <span>Cotización aprobada</span>
                    @if (selectedOrderQuote) {
                      <span class="badge text-bg-success">Sí</span>
                    } @else {
                      <span class="badge text-bg-secondary">No disponible</span>
                    }
                  </div>
                  <div class="order-row">
                    <span>Fecha aprobación</span>
                    @if (selectedOrderQuote) {
                      <span class="badge text-bg-light border">{{ selectedOrderQuote.createdAt | date: 'dd/MM/yy' }}</span>
                      <span class="badge text-bg-secondary">{{ selectedOrderQuote.createdAt | date: 'h:mm a' }}</span>
                    } @else {
                      <span class="badge text-bg-light border">N/A</span>
                    }
                  </div>
                  <div class="order-row"><span>Cliente</span><strong>{{ selectedOrderCustomer?.legalName || 'N/A' }}</strong></div>
                  <div class="order-row"><span>Contacto</span><strong>{{ selectedOrderCustomer?.contactName || 'N/A' }}</strong></div>
                  <div class="order-row"><span>Correo</span><strong>{{ selectedOrderCustomer?.companyEmail || 'N/A' }}</strong></div>
                </div>
              </div>
            </div>

            <div class="row g-3 mt-1">
              <div class="col-lg-6">
                <div class="border rounded p-3 h-100">
                  <h6 class="fw-bold mb-2">Envío</h6>
                  <div class="order-row"><span>Despacho</span><strong>{{ selectedOrderShipment?.id || 'Sin asignar' }}</strong></div>
                  <div class="order-row"><span>Transportista</span><strong>{{ selectedOrderCarrierName }}</strong></div>
                  <div class="order-row"><span>Estado envío</span><app-status-chip [status]="selectedOrderShipment?.status || 'Pendiente'" /></div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="border rounded p-3 h-100">
                  <h6 class="fw-bold mb-2">Acciones</h6>
                  <div class="d-grid gap-2">
                    <button class="btn btn-outline-primary" [disabled]="isApproveDisabled(order.status)" (click)="setOrderStatus(order.id, 'Aprobado')">Marcar como aprobada</button>
                    <button class="btn btn-outline-success" [disabled]="isDispatchDisabled(order.status)" (click)="setOrderStatus(order.id, 'Despachado')">Marcar como despachado</button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AppComponent {
  constructor(
    public readonly profileModal: CustomerProfileModalService,
    public readonly orderModal: OrderDetailModalService,
    public readonly userMenu: UserMenuModalService,
    public readonly store: SessionStoreService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly rules: RuleEngineService,
    private readonly feedback: UiFeedbackService
  ) {}

  async copy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.feedback.push('Dato copiado al portapapeles', 'CRM', 'success', 1400);
    } catch {
      this.feedback.push('No se pudo copiar el dato', 'CRM', 'warning', 1400);
    }
  }

  get selectedOrder() {
    const id = this.orderModal.currentOrderId;
    if (!id) return null;
    return this.store.snapshot.orders.find((o) => o.id === id) ?? null;
  }

  get selectedOrderCustomer() {
    if (!this.selectedOrder) return null;
    return this.store.snapshot.customers.find((c) => c.id === this.selectedOrder!.customerId) ?? null;
  }

  get selectedOrderQuote(): Quote | null {
    if (!this.selectedOrder) return null;
    if (this.selectedOrder.sourceQuoteId) {
      return this.store.snapshot.quotes.find((q) => q.id === this.selectedOrder!.sourceQuoteId) ?? null;
    }
    return this.store.snapshot.quotes.find((q) => q.customerId === this.selectedOrder!.customerId && ['Aprobada', 'Aceptada', 'Convertida a pedido'].includes(q.status)) ?? null;
  }

  get selectedOrderShipment(): Shipment | null {
    if (!this.selectedOrder) return null;
    return this.store.snapshot.shipments.find((s) => s.orderId === this.selectedOrder!.id) ?? null;
  }

  get selectedOrderCarrierName(): string {
    if (!this.selectedOrderShipment) return 'Sin asignar';
    const carrier = this.store.snapshot.carriers.find((c) => c.id === this.selectedOrderShipment!.carrierId);
    return carrier?.name || 'Sin asignar';
  }

  setOrderStatus(orderId: string, status: OrderStatus): void {
    this.rules.updateOrderStatus(orderId, status);
  }

  simulateQuoteDownload(type: 'PDF' | 'DOC'): void {
    const quoteId = this.selectedOrderQuote?.id || 'Q-NA';
    this.feedback.push(`Descarga simulada de ${type} para cotización ${quoteId}`, 'Pedidos', 'info', 1800);
  }

  isApproveDisabled(status: OrderStatus): boolean {
    return ['Aprobado', 'En preparación', 'Despachado', 'Entregado', 'Cerrado'].includes(status);
  }

  isDispatchDisabled(status: OrderStatus): boolean {
    return ['Despachado', 'Entregado', 'Cerrado'].includes(status);
  }

  roleLabel(role?: LoginRole): string {
    return role === 'MASTER' ? 'GERENCIA' : role || '';
  }

  switchUserRole(role: LoginRole): void {
    this.auth.selectRole(role);
    this.store.updateState((state) => ({ ...state, currentUser: null }));
    this.userMenu.close();
    this.router.navigate(['/auth/login']);
  }

  logoutFromUserMenu(): void {
    this.userMenu.close();
    this.auth.logout();
  }
}
